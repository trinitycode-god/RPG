// =============================================
// SHADOWREALM ONLINE - PLAYER ENTITY (Phaser)
// =============================================

class Player {
  constructor(scene, x, y, classType) {
    this.scene = scene;
    this.classType = classType;
    this.x = x;
    this.y = y;

    // Base stats
    this.level = GameState.playerLevel || 1;
    this.exp = GameState.playerExp || 0;
    this.expNeeded = Helpers.expForLevel(this.level);
    this.rank = Helpers.getRank(this.level);
    this.gold = GameState.playerGold || 0;

    this.maxHp = CONSTANTS.BASE_HP[classType] || 100;
    this.hp = GameState.playerHp !== undefined ? GameState.playerHp : this.maxHp;
    this.maxMp = CONSTANTS.BASE_MP[classType] || 100;
    this.mp = GameState.playerMp !== undefined ? GameState.playerMp : this.maxMp;
    this.atk = CONSTANTS.BASE_ATK[classType] || 15;
    this.def = CONSTANTS.BASE_DEF[classType] || 5;
    this.baseSpeed = CONSTANTS.BASE_SPEED;
    this.speed = this.baseSpeed;
    this.critChance = CONSTANTS.CRIT_CHANCE_BASE;

    this.mounted = false;
    this.stealthed = false;
    this.buffAtk = 1.0;
    this.isDead = false;
    this.attackRange = 70;
    this.lastAttackTime = 0;
    this.attackCooldown = 600; // ms between auto-attacks

    this.clones = [];
    this.shadowSoldiers = [];
    this.auraActive = false;

    this.recalcStats();
    this.createSprite();
    this.createHealthBar();
  }

  recalcStats() {
    const classType = this.classType;
    const equipBonus = InventorySystem.getEquipBonus();
    const skillBonus = SkillsSystem.getStatBonus(classType);
    const levelBonus = (this.level - 1) * 0.05;

    const baseHp = CONSTANTS.BASE_HP[classType] || 100;
    const baseMp = CONSTANTS.BASE_MP[classType] || 100;
    const baseAtk = CONSTANTS.BASE_ATK[classType] || 15;
    const baseDef = CONSTANTS.BASE_DEF[classType] || 5;

    this.maxHp = Math.round(baseHp * (1 + levelBonus + skillBonus.hp) + equipBonus.hp + this.level * 5);
    this.maxMp = Math.round(baseMp * (1 + levelBonus + skillBonus.mp) + equipBonus.mp + this.level * 3);
    this.atk = Math.round((baseAtk + equipBonus.atk + this.level * 2) * (1 + levelBonus + skillBonus.atk) * this.buffAtk);
    this.def = Math.round((baseDef + equipBonus.def + this.level * 1) * (1 + levelBonus + skillBonus.def));
    this.baseSpeed = CONSTANTS.BASE_SPEED + equipBonus.speed + skillBonus.speed * 10;
    if (!this.mounted) this.speed = this.baseSpeed;
    this.critChance = CONSTANTS.CRIT_CHANCE_BASE + equipBonus.critChance + skillBonus.crit;

    // Cap HP/MP
    this.hp = Math.min(this.hp, this.maxHp);
    this.mp = Math.min(this.mp, this.maxMp);
  }

  createSprite() {
    const scene = this.scene;
    
    // Create container
    this.container = scene.add.container(this.x, this.y);
    
    // Body graphics
    this.graphics = scene.add.graphics();
    this.drawSprite();
    this.container.add(this.graphics);
    
    // Name text
    this.nameText = scene.add.text(0, -28, GameState.playerName || 'Herói', {
      fontSize: '10px', fill: '#FFD700', fontFamily: 'Rajdhani',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 1);
    this.container.add(this.nameText);
    
    // Aura effect
    this.auraGraphics = scene.add.graphics();
    this.container.add(this.auraGraphics);
    this.auraGraphics.setAlpha(0);
    
    // Shadow/stealth effect
    this.shadowEffect = scene.add.graphics();
    this.container.add(this.shadowEffect);
    
    // Enable physics
    scene.physics.add.existing(this.container);
    this.body = this.container.body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(20, 20);
  }

  drawSprite() {
    const g = this.graphics;
    g.clear();

    const colors = {
      warrior: { body: 0x4466AA, hair: 0x883300, skin: 0xFFCC99, armor: 0x778899 },
      mage: { body: 0x8844CC, hair: 0xAAAAFF, skin: 0xFFCC99, armor: 0x553388 },
      archer: { body: 0x446644, hair: 0xAA6622, skin: 0xFFCC99, armor: 0x335533 },
      shadow: { body: 0x111122, hair: 0x330033, skin: 0xCCAAAA, armor: 0x222233 }
    };
    const c = colors[this.classType] || colors.warrior;

    // Shadow under player
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 12, 18, 6);

    // Legs
    g.fillStyle(c.armor);
    g.fillRect(-5, 7, 4, 7);
    g.fillRect(1, 7, 4, 7);

    // Boots
    g.fillStyle(0x332211);
    g.fillRect(-6, 12, 5, 3);
    g.fillRect(1, 12, 5, 3);

    // Body / armor
    g.fillStyle(c.armor);
    g.fillRect(-6, -1, 12, 10);

    // Body color overlay
    g.fillStyle(c.body, 0.5);
    g.fillRect(-5, 0, 10, 8);

    // Arms
    g.fillStyle(c.skin);
    g.fillRect(-9, -1, 4, 8);
    g.fillRect(5, -1, 4, 8);

    // Head
    g.fillStyle(c.skin);
    g.fillRect(-5, -11, 10, 10);

    // Hair
    g.fillStyle(c.hair);
    g.fillRect(-6, -13, 12, 4);

    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(-3, -8, 2, 2);
    g.fillRect(1, -8, 2, 2);

    // Weapon
    if (this.classType === 'warrior') {
      g.fillStyle(0xAAAACC);
      g.fillRect(6, -7, 2, 16);
      g.fillStyle(0xCCCCDD);
      g.fillRect(4, -4, 6, 2);
    } else if (this.classType === 'mage') {
      g.fillStyle(0x6622AA);
      g.fillRect(7, -12, 2, 18);
      g.fillStyle(0xAA44FF);
      g.fillCircle(8, -13, 4);
      g.fillStyle(0xAAFFFF, 0.8);
      g.fillCircle(8, -13, 2);
    } else if (this.classType === 'archer') {
      g.lineStyle(2, 0x882200);
      g.strokeCircle(9, -4, 9);
      g.lineStyle(1, 0xCCAA88);
      g.lineBetween(9, -13, 9, 5);
    } else if (this.classType === 'shadow') {
      g.fillStyle(0x6600AA);
      g.fillRect(7, -9, 2, 16);
      g.fillStyle(0xAA00FF, 0.8);
      g.fillRect(5, -11, 6, 3);
    }

    // Stealthed
    if (this.stealthed) {
      g.setAlpha(0.3);
    } else {
      g.setAlpha(1.0);
    }
  }

  createHealthBar() {
    this.hpBarBg = this.scene.add.graphics();
    this.hpBarFill = this.scene.add.graphics();
    this.container.add(this.hpBarBg);
    this.container.add(this.hpBarFill);
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.hpBarBg.clear();
    this.hpBarFill.clear();
    
    const w = 24;
    const h = 3;
    const yOff = -16;
    
    this.hpBarBg.fillStyle(0x330000);
    this.hpBarBg.fillRect(-w / 2, yOff, w, h);
    
    const pct = this.hp / this.maxHp;
    this.hpBarFill.fillStyle(pct > 0.5 ? 0x44CC44 : pct > 0.25 ? 0xFFAA00 : 0xFF2200);
    this.hpBarFill.fillRect(-w / 2, yOff, Math.round(w * pct), h);
  }

  updateAura() {
    const g = this.auraGraphics;
    g.clear();
    
    const rank = this.rank;
    const color = parseInt(CONSTANTS.RANK_COLORS[rank]?.replace('#', '0x') || '0xFFFF00');
    
    if (['S', 'SS', 'SSS', 'MONARCH'].includes(rank)) {
      g.lineStyle(2, color, 0.6 + Math.sin(Date.now() * 0.005) * 0.3);
      g.strokeCircle(0, 0, 18 + Math.sin(Date.now() * 0.003) * 3);
      g.setAlpha(0.8);
    } else if (['A', 'B'].includes(rank)) {
      g.lineStyle(1, color, 0.4);
      g.strokeCircle(0, 0, 15);
      g.setAlpha(0.5);
    } else {
      g.setAlpha(0);
    }
  }

  gainExp(amount) {
    this.exp += amount;
    
    while (this.exp >= this.expNeeded) {
      this.exp -= this.expNeeded;
      this.levelUp();
    }
    
    GameState.playerExp = this.exp;
    HUD.updateBars();
  }

  levelUp() {
    this.level++;
    this.expNeeded = Helpers.expForLevel(this.level);
    GameState.playerLevel = this.level;
    GameState.skillPoints = (GameState.skillPoints || 0) + 2;
    
    // Restore HP/MP on level up
    this.recalcStats();
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    
    // Check rank
    const newRank = Helpers.getRank(this.level);
    if (newRank !== this.rank) {
      this.rank = newRank;
      Notifications.rankUp(newRank);
      HUD.addLog(`Rank evoluiu para ${newRank}!`, 'crit');
    }
    
    Notifications.levelUp(this.level);
    HUD.addLog(`Level Up! Nível ${this.level}!`, 'crit');
    
    // Level up particle effect
    this.spawnLevelUpEffect();
  }

  spawnLevelUpEffect() {
    const scene = this.scene;
    if (!scene) return;
    
    // Burst of particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = scene.add.graphics();
      particle.fillStyle(0xFFD700);
      particle.fillCircle(0, 0, 3);
      particle.x = this.container.x;
      particle.y = this.container.y;
      
      const speed = Helpers.randFloat(60, 120);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      scene.tweens.add({
        targets: particle,
        x: particle.x + vx,
        y: particle.y + vy,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  autoAttack(target) {
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) return false;
    if (!target || target.isDead) return false;
    
    this.lastAttackTime = now;
    
    const result = CombatSystem.calcDamage(this, target);
    
    if (result.type === 'miss') {
      HUD.addLog('Ataque errou!', 'dmg');
      const screenPos = this.scene.cameras.main.worldView;
      Helpers.showDamageNumber(
        target.container?.x - screenPos.x + window.innerWidth / 2,
        target.container?.y - screenPos.y + window.innerHeight / 2 - 20,
        0, 'miss'
      );
      return false;
    }
    
    CombatSystem.applyDamage(target, result.amount, result.type);
    
    // Lifesteal for shadow class
    if (this.classType === 'shadow') {
      const skillBonus = SkillsSystem.getStatBonus('shadow');
      if (skillBonus.lifesteal) {
        CombatSystem.applyLifesteal(this, result.amount, skillBonus.lifesteal);
      }
    }
    
    // Show damage
    const cam = this.scene.cameras.main;
    const sx = target.container.x - cam.scrollX;
    const sy = target.container.y - cam.scrollY;
    Helpers.showDamageNumber(sx, sy - 20, result.amount, result.type);
    
    // Log
    const logType = result.type === 'crit' ? 'crit' : 'dmg';
    HUD.addLog(`${result.type === 'crit' ? '⚡CRÍTICO! ' : ''}-${result.amount} HP`, logType);
    
    HUD.updateBars();
    return true;
  }

  update(cursors, wasd, pointer, time) {
    if (this.isDead) return;
    if (!this.body) return;
    
    let vx = 0, vy = 0;
    
    // Movement
    if (cursors.left.isDown || wasd.left.isDown) vx = -this.speed;
    else if (cursors.right.isDown || wasd.right.isDown) vx = this.speed;
    
    if (cursors.up.isDown || wasd.up.isDown) vy = -this.speed;
    else if (cursors.down.isDown || wasd.down.isDown) vy = this.speed;
    
    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }
    
    this.body.setVelocity(vx, vy);
    this.x = this.container.x;
    this.y = this.container.y;
    
    // Update graphics
    this.updateHealthBar();
    this.updateAura();
    
    // MP regen
    if (this.mp < this.maxMp) {
      this.mp = Math.min(this.maxMp, this.mp + 0.02);
    }
    
    // HP regen (slow)
    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 0.005);
    }
    
    // Burn DoT processing
    if (this.burned) {
      this.burned.tick += 16;
      if (this.burned.tick >= 1000) {
        this.burned.tick = 0;
        const dmg = Math.round(this.burned.tickDmg);
        this.hp = Math.max(0, this.hp - dmg);
        HUD.addLog(`-${dmg} HP (queimadura)`, 'dmg');
        this.burned.duration -= 1000;
        if (this.burned.duration <= 0) delete this.burned;
        if (this.hp <= 0) this.die();
      }
    }
    
    // Save state periodically
    GameState.playerHp = this.hp;
    GameState.playerMp = this.mp;
    GameState.playerGold = this.gold;
  }

  die() {
    this.isDead = true;
    this.hp = 0;
    HUD.addLog('Você foi derrotado! Ressuscitando...', 'system');
    Notifications.show('💀 Você morreu! Ressuscitando...', '');
    
    setTimeout(() => {
      this.isDead = false;
      this.hp = Math.round(this.maxHp * 0.5);
      this.mp = Math.round(this.maxMp * 0.5);
      // Respawn in town
      if (this.scene && this.container) {
        this.container.x = 400;
        this.container.y = 300;
      }
      HUD.updateBars();
      Notifications.show('✨ Ressuscitado na cidade!', '');
    }, 3000);
  }

  destroy() {
    if (this.container) this.container.destroy();
  }
}
