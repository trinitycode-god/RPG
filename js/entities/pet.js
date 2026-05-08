// =============================================
// SHADOWREALM ONLINE - PET ENTITY (Phaser)
// =============================================

class Pet {
  constructor(scene, x, y, petType, owner) {
    this.scene = scene;
    this.owner = owner;
    this.type = petType;
    this.isDead = false;

    const data = CONSTANTS.PET_TYPES[petType];
    if (!data) { this.isDead = true; return; }

    this.name = data.name;
    this.rarity = data.rarity;
    this.baseAtk = data.atk;
    this.atk = data.atk;
    this.maxHp = data.hp;
    this.hp = data.hp;
    this.icon = data.icon;
    this.speed = 140;
    this.attackRange = 60;
    this.aggroRange = 150;
    this.attackCd = 1500;
    this.lastAttack = 0;
    this.followDist = 50;
    this.level = 1;
    this.exp = 0;

    this.createSprite(x, y);
    HUD.updatePet(this);
  }

  createSprite(x, y) {
    const scene = this.scene;
    this.container = scene.add.container(x, y);

    this.gfx = scene.add.graphics();
    this.drawSprite();
    this.container.add(this.gfx);

    // Name above
    this.nameText = scene.add.text(0, -22, this.name, {
      fontSize: '9px', fill: CONSTANTS.RARITY_COLORS[this.rarity] || '#fff',
      fontFamily: 'Rajdhani', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 1);
    this.container.add(this.nameText);

    // HP bar
    this.hpBg = scene.add.graphics();
    this.hpFill = scene.add.graphics();
    this.container.add(this.hpBg);
    this.container.add(this.hpFill);
    this.updateHPBar();

    scene.physics.add.existing(this.container);
    this.physics = this.container.body;
    this.physics.setSize(18, 18);
  }

  drawSprite() {
    const g = this.gfx;
    g.clear();

    const icons = {
      spirit_wolf: { body: 0x8888CC, eye: 0x88FFFF },
      fire_fox: { body: 0xFF6600, eye: 0xFFFF00 },
      shadow_panther: { body: 0x220033, eye: 0xFF00FF },
      storm_eagle: { body: 0x4488FF, eye: 0xFFFFFF },
      dark_dragon: { body: 0x110022, eye: 0xFF0000 }
    };
    const c = icons[this.type] || { body: 0x888888, eye: 0xFFFFFF };

    // Glow aura based on rarity
    if (this.rarity === 'legendary') {
      g.lineStyle(2, 0xFF8800, 0.7);
      g.strokeCircle(0, 0, 14);
    } else if (this.rarity === 'epic') {
      g.lineStyle(1, 0xAA44FF, 0.6);
      g.strokeCircle(0, 0, 12);
    }

    // Body
    g.fillStyle(c.body);
    if (this.type === 'storm_eagle') {
      // Bird shape
      g.fillTriangle(-12, 2, 12, 2, 0, -10);
      g.fillEllipse(0, 4, 18, 10);
      g.fillTriangle(-12, 6, -20, -2, 0, 4);
      g.fillTriangle(12, 6, 20, -2, 0, 4);
    } else if (this.type === 'dark_dragon') {
      g.fillEllipse(0, 2, 20, 14);
      g.fillCircle(7, -6, 7);
      g.fillTriangle(3, -10, 7, -17, 11, -10);
      g.fillTriangle(10, -8, 14, -15, 18, -8);
    } else {
      // 4-legged animal base
      g.fillEllipse(0, 2, 22, 12);
      g.fillCircle(9, -5, 7);
      // Legs
      g.fillRect(-8, 7, 4, 6);
      g.fillRect(-3, 7, 4, 6);
      g.fillRect(2, 7, 4, 6);
      g.fillRect(7, 7, 4, 6);
    }

    // Eyes
    g.fillStyle(c.eye);
    g.fillCircle(10, -7, 2);

    // Special effects per type
    if (this.type === 'fire_fox') {
      g.fillStyle(0xFF4400, 0.6);
      g.fillCircle(Helpers.randInt(-8, 8), Helpers.randInt(-8, 0), 3);
    } else if (this.type === 'shadow_panther') {
      g.fillStyle(0xAA00FF, 0.4);
      g.fillEllipse(0, 2, 24, 16);
    }
  }

  updateHPBar() {
    this.hpBg.clear();
    this.hpFill.clear();
    const w = 20, h = 3, yOff = -18;
    this.hpBg.fillStyle(0x220000);
    this.hpBg.fillRect(-w / 2, yOff, w, h);
    const pct = Math.max(0, this.hp / this.maxHp);
    this.hpFill.fillStyle(0x44CC44);
    this.hpFill.fillRect(-w / 2, yOff, Math.round(w * pct), h);
  }

  gainExp(amount) {
    this.exp += amount;
    const needed = 50 * this.level;
    if (this.exp >= needed) {
      this.exp -= needed;
      this.level++;
      this.atk = Math.round(this.baseAtk * (1 + (this.level - 1) * 0.15));
      this.maxHp = Math.round(CONSTANTS.PET_TYPES[this.type]?.hp * (1 + (this.level - 1) * 0.10));
      this.hp = this.maxHp;
      HUD.addLog(`${this.name} subiu para Nível ${this.level}!`, 'crit');
      Notifications.show(`🐾 ${this.name} Nível ${this.level}!`, 'item');
    }
    HUD.updatePet(this);
  }

  update(time, enemies) {
    if (this.isDead || !this.owner) return;

    const ox = this.owner.container?.x || this.owner.x;
    const oy = this.owner.container?.y || this.owner.y;
    const px = this.container.x;
    const py = this.container.y;

    // Find nearest living enemy
    let nearestEnemy = null;
    let nearestDist = this.aggroRange;

    if (enemies) {
      enemies.forEach(e => {
        if (!e || e.isDead) return;
        const ex = e.container?.x || e.x;
        const ey = e.container?.y || e.y;
        const d = Helpers.dist(px, py, ex, ey);
        if (d < nearestDist) {
          nearestDist = d;
          nearestEnemy = e;
        }
      });
    }

    if (nearestEnemy && !nearestEnemy.isDead) {
      // Chase enemy
      const ex = nearestEnemy.container.x;
      const ey = nearestEnemy.container.y;
      const dx = ex - px;
      const dy = ey - py;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > this.attackRange) {
        this.physics.setVelocity((dx / d) * this.speed, (dy / d) * this.speed);
      } else {
        this.physics.setVelocity(0, 0);
        // Attack
        if (time - this.lastAttack > this.attackCd) {
          this.lastAttack = time;
          const result = CombatSystem.calcDamage(this, nearestEnemy);
          if (result.type !== 'miss') {
            CombatSystem.applyDamage(nearestEnemy, result.amount, result.type);
            HUD.addLog(`${this.name}: -${result.amount} HP`, 'dmg');
            nearestEnemy.updateHPBar();
            if (nearestEnemy.isDead || nearestEnemy.hp <= 0) {
              nearestEnemy.isDead = true;
            }
          }
        }
      }
    } else {
      // Follow owner
      const dx = ox - px;
      const dy = oy - py;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > this.followDist) {
        this.physics.setVelocity((dx / d) * this.speed, (dy / d) * this.speed);
      } else {
        // Idle bob
        this.physics.setVelocity(0, 0);
        this.container.y = oy + 30 + Math.sin(time * 0.003) * 3;
      }
    }

    this.updateHPBar();
  }

  destroy() {
    if (this.container) this.container.destroy();
  }
}

// Pet capture system
const PetSystem = {
  capturedPets: [],
  activePet: null,

  tryCapture(enemyType, scene, owner) {
    // Need monster core in inventory
    const coreIdx = InventorySystem.items.findIndex(i => i && i.id === 'monster_core');
    if (coreIdx === -1) {
      HUD.addLog('Precisa de Núcleo de Monstro para capturar!', 'system');
      return false;
    }

    // Map enemy to pet type
    const enemyToPet = {
      wolf: 'spirit_wolf',
      slime: null,
      goblin: null,
      skeleton: null,
      orc: null,
      dark_knight: 'shadow_panther',
      dragon: 'dark_dragon'
    };

    const petType = enemyToPet[enemyType];
    if (!petType) {
      HUD.addLog('Este monstro não pode ser capturado!', 'system');
      return false;
    }

    const petData = CONSTANTS.PET_TYPES[petType];
    if (!petData) return false;

    if (Helpers.chance(petData.captureChance)) {
      InventorySystem.removeItem(coreIdx, 1);
      this.capturedPets.push(petType);

      if (!this.activePet) {
        this.activePet = new Pet(
          scene,
          owner.container.x + 30,
          owner.container.y,
          petType,
          owner
        );
        GameState.activePet = this.activePet;
      }

      Notifications.show(`🐾 ${petData.name} capturado!`, 'item');
      HUD.addLog(`${petData.name} capturado com sucesso!`, 'loot');
      return true;
    } else {
      HUD.addLog('A captura falhou...', 'system');
      return false;
    }
  },

  summonPet(scene, owner) {
    if (this.capturedPets.length === 0) {
      HUD.addLog('Nenhum pet capturado!', 'system');
      return;
    }
    if (this.activePet) {
      this.activePet.destroy();
      this.activePet = null;
      GameState.activePet = null;
      HUD.addLog('Pet dispensado.', 'system');
      HUD.updatePet(null);
      return;
    }
    const petType = this.capturedPets[0];
    this.activePet = new Pet(scene, owner.container.x + 30, owner.container.y, petType, owner);
    GameState.activePet = this.activePet;
    HUD.addLog(`${this.activePet.name} invocado!`, 'system');
  }
};
