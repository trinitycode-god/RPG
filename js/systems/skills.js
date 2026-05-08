// =============================================
// SHADOWREALM ONLINE - SKILLS SYSTEM
// =============================================

const SkillsSystem = {
  // All skills definitions per class
  definitions: {
    warrior: {
      q: { name: 'Golpe Poderoso', icon: '⚔', desc: 'Golpe forte que causa 150% de dano físico', mp: 10, cd: 1500, damage: 1.5, range: 60, type: 'melee' },
      w: { name: 'Grito de Guerra', icon: '😤', desc: 'Aumenta ataque em 30% por 5 segundos', mp: 20, cd: 8000, buff: { atk: 1.3, duration: 5000 }, type: 'buff' },
      e: { name: 'Investida', icon: '⚡', desc: 'Dash em direção ao inimigo causando dano', mp: 25, cd: 5000, damage: 1.2, range: 200, type: 'dash' },
      r: { name: 'Fúria do Guerreiro', icon: '🔥', desc: 'Ataque giratório que atinge todos ao redor', mp: 40, cd: 12000, damage: 2.0, range: 100, aoe: true, type: 'aoe' },
      f: { name: 'Chamar Companheiro', icon: '🐾', desc: 'Invoca seu pet para batalha', mp: 15, cd: 3000, type: 'pet' }
    },
    mage: {
      q: { name: 'Bola de Fogo', icon: '🔥', desc: 'Lança uma bola de fogo explosiva (Naruto: Katon!)', mp: 15, cd: 800, damage: 2.0, range: 250, type: 'projectile', effect: 'burn' },
      w: { name: 'Raio Arcano', icon: '⚡', desc: 'Raio de energia mágica contínuo', mp: 30, cd: 6000, damage: 1.8, range: 200, type: 'beam' },
      e: { name: 'Teletransporte', icon: '🌀', desc: 'Teleporta instantaneamente em direção ao cursor', mp: 20, cd: 4000, type: 'teleport' },
      r: { name: 'Meteoro Negro', icon: '☄️', desc: 'Invoca um meteoro de energia sombria', mp: 60, cd: 15000, damage: 4.0, range: 150, aoe: true, type: 'meteor' },
      f: { name: 'Chamar Familiar', icon: '🐾', desc: 'Invoca seu familiar mágico', mp: 15, cd: 3000, type: 'pet' }
    },
    archer: {
      q: { name: 'Flecha Tripla', icon: '🏹', desc: 'Dispara 3 flechas em cone', mp: 10, cd: 1200, damage: 0.8, range: 300, count: 3, type: 'multishot' },
      w: { name: 'Flecha de Gelo', icon: '❄️', desc: 'Flecha que congela o inimigo por 2s', mp: 20, cd: 7000, damage: 1.2, range: 280, type: 'projectile', effect: 'freeze' },
      e: { name: 'Salto Ninja', icon: '🌪️', desc: 'Salta para trás escapando do perigo (Naruto: Body Flicker!)', mp: 15, cd: 4000, type: 'backflip' },
      r: { name: 'Chuva de Flechas', icon: '⬇️', desc: 'Área de flechas que cobre grande região', mp: 50, cd: 14000, damage: 1.5, range: 200, aoe: true, type: 'aoe' },
      f: { name: 'Chamar Parceiro', icon: '🐾', desc: 'Invoca seu animal de estimação', mp: 15, cd: 3000, type: 'pet' }
    },
    shadow: {
      q: { name: 'Extração Sombria', icon: '💀', desc: 'Drena a vida do inimigo (Solo Leveling: Shadow Extraction!)', mp: 20, cd: 1000, damage: 1.8, range: 80, type: 'drain', effect: 'lifesteal' },
      w: { name: 'Clones das Sombras', icon: '👥', desc: 'Cria 3 clones que atacam automaticamente (Naruto: Kage Bunshin!)', mp: 35, cd: 10000, damage: 0.6, count: 3, type: 'clone', duration: 6000 },
      e: { name: 'Passo das Sombras', icon: '🌑', desc: 'Teleporta para as sombras ficando invisível por 3s', mp: 25, cd: 5000, type: 'stealth', duration: 3000 },
      r: { name: 'Exército das Sombras', icon: '⚔️', desc: 'Invoca soldados sombrios para lutar por você', mp: 80, cd: 20000, damage: 1.5, count: 5, type: 'summon', duration: 10000 },
      f: { name: 'Chamar Sombra', icon: '🐾', desc: 'Invoca seu pet sombrio', mp: 15, cd: 3000, type: 'pet' }
    }
  },

  // Skill tree (passive upgrades)
  trees: {
    warrior: [
      { id: 'sw1', name: 'Força Bruta', desc: '+15% Ataque físico', cost: 1, maxRank: 5, effect: { atk: 0.15 } },
      { id: 'sw2', name: 'Pele de Aço', desc: '+10% Defesa', cost: 1, maxRank: 5, effect: { def: 0.10 } },
      { id: 'sw3', name: 'Vigor', desc: '+20% HP máximo', cost: 2, maxRank: 3, effect: { hp: 0.20 } },
      { id: 'sw4', name: 'Crítico Certeiro', desc: '+5% Chance de crítico', cost: 2, maxRank: 3, effect: { crit: 0.05 } },
      { id: 'sw5', name: 'Aura do Guerreiro', desc: 'Aura que dano área ao redor', cost: 3, maxRank: 1, effect: { aura: true } }
    ],
    mage: [
      { id: 'sm1', name: 'Intelecto', desc: '+20% Dano mágico', cost: 1, maxRank: 5, effect: { magic: 0.20 } },
      { id: 'sm2', name: 'Concentração', desc: '-10% Custo de MP', cost: 1, maxRank: 5, effect: { mpCost: -0.10 } },
      { id: 'sm3', name: 'Reserva Arcana', desc: '+25% MP máximo', cost: 2, maxRank: 3, effect: { mp: 0.25 } },
      { id: 'sm4', name: 'Mente Penetrante', desc: '+10% Penetração mágica', cost: 2, maxRank: 3, effect: { pen: 0.10 } },
      { id: 'sm5', name: 'Transcendência', desc: 'Habilidades ganham efeito extra', cost: 3, maxRank: 1, effect: { transcend: true } }
    ],
    archer: [
      { id: 'sa1', name: 'Olho de Águia', desc: '+10% Range de habilidades', cost: 1, maxRank: 5, effect: { range: 0.10 } },
      { id: 'sa2', name: 'Agilidade', desc: '+10% Velocidade', cost: 1, maxRank: 5, effect: { speed: 0.10 } },
      { id: 'sa3', name: 'Golpe Preciso', desc: '+8% Crítico', cost: 2, maxRank: 3, effect: { crit: 0.08 } },
      { id: 'sa4', name: 'Flecha Perfurante', desc: 'Flechas atravessam inimigos', cost: 2, maxRank: 1, effect: { pierce: true } },
      { id: 'sa5', name: 'Chuva Infinita', desc: 'Reduz cooldown em 30%', cost: 3, maxRank: 1, effect: { cdReduce: 0.30 } }
    ],
    shadow: [
      { id: 'ss1', name: 'Poder das Sombras', desc: '+25% Dano nas sombras', cost: 1, maxRank: 5, effect: { shadowDmg: 0.25 } },
      { id: 'ss2', name: 'Elo Sombrio', desc: 'Pets sombrios mais fortes', cost: 1, maxRank: 3, effect: { petBonus: 0.30 } },
      { id: 'ss3', name: 'Roubo de Vida', desc: '+10% Lifesteal em ataques', cost: 2, maxRank: 3, effect: { lifesteal: 0.10 } },
      { id: 'ss4', name: 'Domínio Sombrio', desc: 'Rank evolui mais rápido', cost: 2, maxRank: 1, effect: { rankBonus: true } },
      { id: 'ss5', name: 'Monarca das Sombras', desc: 'Forma especial de Monarca', cost: 5, maxRank: 1, effect: { monarch: true } }
    ]
  },

  // Player's unlocked skills and ranks
  playerSkills: {},

  initPlayer(classType) {
    SkillsSystem.playerSkills = {};
    const tree = SkillsSystem.trees[classType] || [];
    tree.forEach(skill => {
      SkillsSystem.playerSkills[skill.id] = { rank: 0, maxRank: skill.maxRank };
    });
  },

  unlockSkill(skillId, classType) {
    const tree = SkillsSystem.trees[classType] || [];
    const skillDef = tree.find(s => s.id === skillId);
    if (!skillDef) return false;
    
    const current = SkillsSystem.playerSkills[skillId];
    if (!current) return false;
    if (current.rank >= current.maxRank) return false;
    
    // Check skill points (stored in GameState)
    if (GameState.skillPoints < skillDef.cost) return false;
    
    GameState.skillPoints -= skillDef.cost;
    current.rank++;
    return true;
  },

  // Get effective stats bonus from skill tree
  getStatBonus(classType) {
    const tree = SkillsSystem.trees[classType] || [];
    const bonus = { atk: 0, def: 0, hp: 0, mp: 0, speed: 0, crit: 0, range: 0 };
    
    tree.forEach(skillDef => {
      const playerSkill = SkillsSystem.playerSkills[skillDef.id];
      if (!playerSkill || playerSkill.rank === 0) return;
      
      const mult = playerSkill.rank;
      if (skillDef.effect.atk) bonus.atk += skillDef.effect.atk * mult;
      if (skillDef.effect.def) bonus.def += skillDef.effect.def * mult;
      if (skillDef.effect.hp) bonus.hp += skillDef.effect.hp * mult;
      if (skillDef.effect.mp) bonus.mp += skillDef.effect.mp * mult;
      if (skillDef.effect.speed) bonus.speed += skillDef.effect.speed * mult;
      if (skillDef.effect.crit) bonus.crit += skillDef.effect.crit * mult;
      if (skillDef.effect.range) bonus.range += skillDef.effect.range * mult;
    });
    
    return bonus;
  }
};
