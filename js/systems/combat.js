// =============================================
// SHADOWREALM ONLINE - COMBAT SYSTEM
// =============================================

const CombatSystem = {
  // Calculate damage
  calcDamage(attacker, target, multiplier = 1.0) {
    const baseAtk = attacker.atk || 10;
    const baseDef = target.def || 0;
    
    // Miss chance
    if (Helpers.chance(CONSTANTS.MISS_CHANCE)) {
      return { amount: 0, type: 'miss' };
    }
    
    // Base damage
    let dmg = Math.max(1, baseAtk * multiplier - baseDef * 0.5);
    dmg *= Helpers.randFloat(0.85, 1.15); // variance
    
    // Critical hit
    const critChance = (attacker.critChance || CONSTANTS.CRIT_CHANCE_BASE);
    if (Helpers.chance(critChance)) {
      dmg *= CONSTANTS.CRIT_MULTIPLIER;
      return { amount: Math.round(dmg), type: 'crit' };
    }
    
    return { amount: Math.round(dmg), type: 'normal' };
  },

  // Apply hit to target
  applyDamage(target, amount, type) {
    if (!target || target.isDead) return;
    target.hp = Math.max(0, target.hp - amount);
    if (target.hp <= 0) target.isDead = true;
    return target.isDead;
  },

  // Lifesteal
  applyLifesteal(player, dmgDealt, percent) {
    const healed = Math.round(dmgDealt * percent);
    player.hp = Math.min(player.maxHp, player.hp + healed);
    return healed;
  },

  // Apply skill effect
  applySkillEffect(effect, target, player) {
    if (!effect) return;
    
    switch (effect) {
      case 'burn':
        // Burn DoT - handled by game scene
        target.burned = { duration: 3000, tickDmg: Math.round(player.atk * 0.3), tick: 0 };
        break;
      case 'freeze':
        target.frozen = { duration: 2000 };
        target.speed = 0;
        setTimeout(() => {
          if (target && !target.isDead) target.speed = target.baseSpeed;
        }, 2000);
        break;
      case 'lifesteal':
        // Applied per hit
        break;
    }
  }
};
