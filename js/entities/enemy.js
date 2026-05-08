// =============================================
// SHADOWREALM ONLINE - ENEMY ENTITY (Phaser)
// =============================================

class Enemy {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
    this.isDead = false;
    this.frozen = false;
    this.burned = null;

    const data = CONSTANTS.ENEMY_TYPES[type];
    if (!data) { this.isDead = true; return; }

    this.name = data.name;
    this.maxHp = data.hp;
    this.hp = data.hp;
    this.atk = data.atk;
    this.def = data.def;
    this.exp = data.exp;
    this.gold = data.gold;
    this.color = data.color;
    this.size = data.size || 1.0;
    this.baseSpeed = data.speed || 60;
    this.speed = this.baseSpeed;
    this.dropChance = data.dropChance;
    this.isBoss = data.boss || false;
    this.critChance = 0.03;

    this.aggroRange = this.isBoss ? 200 : 120;
    this.attackRange = this.isBoss ? 80 : 45;
    this.attackCd = this.isBoss ? 1200 : 1800;
    this.lastAttack = 0;
    this.state = 'idle'; // idle, chase, attack
    this.idleTimer = 0;
    this.idleDirX = 0;
    this.idleDirY = 0;
    this.idleDirTimer = 0;

    this.createSprite();
    this.createUI();
  }

  createSprite() {
    const scene = this.scene;
    const s = this.size;

    this.container = scene.add.container(this.x, this.y);

    // Main body
    this.body_gfx = scene.add.graphics();
    this.drawBody();
    this.container.add(this.body_gfx);

    // Enable physics
    scene.physics.add.existing(this.container);
    this.physics = this.container.body;
    this.physics.setCollideWorldBounds(true);
    const bodySize = Math.round(20 * s);
    this.physics.setSize(bodySize, bodySize);

    // Burn effect overlay
    this.burnGfx = scene.add.graphics();
    this.burnGfx.setAlpha(0);
    this.container.add(this.burnGfx);

    // Freeze effect
    this.freezeGfx = scene.add.graphics();
    this.freezeGfx.setAlpha(0);
    this.container.add(this.freezeGfx);
  }

  drawBody() {
    const g = this.body_gfx;
    const s = this.size;
    g.clear();

    const c = this.color;
    const darkerC = Math.max(0, c - 0x222222);

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 14 * s, 20 * s, 6 * s);

    if (this.type === 'slime') {
      g.fillStyle(c, 0.8);
      g.fillCircle(0, 0, 12 * s);
      g.fillStyle(c);
      g.fillCircle(0, -3 * s, 10 * s);
      g.fillStyle(0x000000);
      g.fillCircle(-3 * s, -4 * s, 2 * s);
      g.fillCircle(3 * s, -4 * s, 2 * s);
    } else if (this.type === 'goblin') {
      // Legs
      g.fillStyle(darkerC);
      g.fillRect(-5 * s, 6 * s, 4 * s, 8 * s);
      g.fillRect(1 * s, 6 * s, 4 * s, 8 * s);
      // Body
      g.fillStyle(c);
      g.fillRect(-7 * s, -2 * s, 14 * s, 10 * s);
      // Head
      g.fillCircle(0, -8 * s, 8 * s);
      // Ears
      g.fillTriangle(-8 * s, -12 * s, -14 * s, -16 * s, -4 * s, -8 * s);
      g.fillTriangle(8 * s, -12 * s, 14 * s, -16 * s, 4 * s, -8 * s);
      // Eyes
      g.fillStyle(0xFF0000);
      g.fillCircle(-3 * s, -9 * s, 2 * s);
      g.fillCircle(3 * s, -9 * s, 2 * s);
    } else if (this.type === 'skeleton') {
      // Skeleton shape
      g.fillStyle(c);
      // Skull
      g.fillCircle(0, -10 * s, 9 * s);
      // Body
      g.fillRect(-5 * s, -2 * s, 10 * s, 12 * s);
      // Legs
      g.fillRect(-5 * s, 8 * s, 4 * s, 8 * s);
      g.fillRect(1 * s, 8 * s, 4 * s, 8 * s);
      // Eye sockets (dark)
      g.fillStyle(0x000000);
      g.fillCircle(-3 * s, -11 * s, 2 * s);
      g.fillCircle(3 * s, -11 * s, 2 * s);
      // Ribs
      g.fillStyle(0x888888, 0.5);
      for (let i = 0; i < 3; i++) {
        g.fillRect(-4 * s, (-1 + i * 4) * s, 8 * s, 2 * s);
      }
    } else if (this.type === 'wolf') {
      g.fillStyle(c);
      // Body
      g.fillEllipse(0, 2 * s, 20 * s, 14 * s);
      // Head
      g.fillCircle(8 * s, -6 * s, 9 * s);
      // Snout
      g.fillRect(12 * s, -8 * s, 8 * s, 6 * s);
      // Ears
      g.fillTriangle(4 * s, -13 * s, 8 * s, -18 * s, 12 * s, -13 * s);
      // Tail
      g.lineStyle(4 * s, c);
      g.strokeCircle(-12 * s, -4 * s, 8 * s);
      // Eyes
      g.fillStyle(0xFFFF00);
      g.fillCircle(10 * s, -8 * s, 2 * s);
    } else if (this.type === 'orc') {
      g.fillStyle(c);
      // Chunky body
      g.fillRect(-10 * s, -5 * s, 20 * s, 16 * s);
      // Head
      g.fillCircle(0, -12 * s, 11 * s);
      // Tusks
      g.fillStyle(0xFFFFCC);
      g.fillRect(-5 * s, -5 * s, 3 * s, 6 * s);
      g.fillRect(2 * s, -5 * s, 3 * s, 6 * s);
      // Eyes
      g.fillStyle(0xFF4400);
      g.fillCircle(-4 * s, -14 * s, 3 * s);
      g.fillCircle(4 * s, -14 * s, 3 * s);
      // Club weapon
      g.fillStyle(0x664422);
      g.fillRect(10 * s, -14 * s, 5 * s, 22 * s);
      g.fillStyle(0x442200);
      g.fillCircle(12 * s, -14 * s, 6 * s);
    } else if (this.type === 'dark_knight') {
      g.fillStyle(c);
      g.fillRect(-10 * s, -5 * s, 20 * s, 18 * s);
      g.fillCircle(0, -14 * s, 12 * s);
      g.fillStyle(0xAA00FF, 0.5);
      g.fillRect(-11 * s, -6 * s, 22 * s, 20 * s);
      g.fillStyle(0xFF0044);
      g.fillRect(-4 * s, -16 * s, 4 * s, 4 * s);
      g.fillRect(0 * s, -16 * s, 4 * s, 4 * s);
      g.fillStyle(0x8800AA);
      g.fillRect(10 * s, -18 * s, 4 * s, 26 * s);
      g.fillStyle(0xCC00FF, 0.8);
      g.fillCircle(12 * s, -18 * s, 6 * s);
    } else if (this.type === 'dragon') {
      // Epic dragon boss
      g.fillStyle(c);
      g.fillEllipse(0, 0, 40 * s, 30 * s);
      g.fillCircle(18 * s, -15 * s, 16 * s);
      g.fillStyle(0xFF6600);
      g.fillTriangle(10 * s, -24 * s, 16 * s, -34 * s, 22 * s, -24 * s);
      g.fillTriangle(20 * s, -22 * s, 26 * s, -32 * s, 32 * s, -22 * s);
      g.fillStyle(0xFF0000);
      g.fillRect(14 * s, -18 * s, 4 * s, 4 * s);
      g.fillRect(20 * s, -18 * s, 4 * s, 4 * s);
      g.fillStyle(0xFF6600, 0.5);
      g.fillTriangle(-25 * s, -20 * s, -40 * s, -10 * s, -10 * s, 0);
      g.fillTriangle(-25 * s, -20 * s, -40 * s, -35 * s, -10 * s, -15 * s);
    } else {
      // Default enemy
      g.fillStyle(c);
      g.fillRect(-10 * s, -14 * s, 20 * s, 28 * s);
      g.fillCircle(0, -16 * s, 10 * s);
      g.fillStyle(0xFF0000);
      g.fillRect(-3 * s, -18 * s, 3 * s, 3 * s);
      g.fillRect(0, -18 * s, 3 * s, 3 * s);
    }

    // Boss indicator
    if (this.isBoss) {
      g.lineStyle(3, 0xFFD700);
      g.strokeCircle(0, -22 * s, 6 * s);
    }
  }

  createUI() {
    const scene = this.scene;
    const s = this.size;

    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();
    this.hpBarBg.setDepth(1);
    this.hpBarFill.setDepth(2);

    // Name text
    this.nameText = scene.add.text(0, -(20 + 14) * s, this.name, {
      fontSize: this.isBoss ? '12px' : '10px',
      fill: this.isBoss ? '#FFD700' : '#FFFFFF',
      fontFamily: 'Rajdhani',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5, 1);
    this.container.add(this.nameText);
    this.container.add(this.hpBarBg);
    this.container.add(this.hpBarFill);

    this.updateHPBar();
  }

  updateHPBar() {
    this.hpBarBg.clear();
    this.hpBarFill.clear();

    const s = this.size;
    const w = this.isBoss ? 60 : 30;
    const h = this.isBoss ? 6 : 4;
    const yOff = -(20 + 4) * s;

    this.hpBarBg.fillStyle(0x220000);
    this.hpBarBg.fillRect(-w / 2, yOff, w, h);

    const pct = Math.max(0, this.hp / this.maxHp);
    const barColor = pct > 0.5 ? 0x22CC22 : pct > 0.25 ? 0xFFAA00 : 0xFF2200;
    this.hpBarFill.fillStyle(barColor);
    this.hpBarFill.fillRect(-w / 2, yOff, Math.round(w * pct), h);
  }

  update(playerX, playerY, time) {
    if (this.isDead) return;
    if (!this.physics) return;

    const dx = playerX - this.container.x;
    const dy = playerY - this.container.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Burn DoT
    if (this.burned) {
      this.burned.tick = (this.burned.tick || 0) + 16;
      if (this.burned.tick >= 1000) {
        this.burned.tick = 0;
        this.hp = Math.max(0, this.hp - this.burned.tickDmg);
        this.burned.duration -= 1000;
        
        this.burnGfx.clear();
        this.burnGfx.fillStyle(0xFF6600, 0.5);
        this.burnGfx.fillCircle(0, 0, 15 * this.size);
        this.burnGfx.setAlpha(0.7);
        
        if (this.burned.duration <= 0) {
          delete this.burned;
          this.burnGfx.clear();
          this.burnGfx.setAlpha(0);
        }
        
        if (this.hp <= 0) { this.die(); return; }
        this.updateHPBar();
      }
    }

    // Freeze display
    if (this.frozen) {
      this.freezeGfx.setAlpha(0.5);
      this.physics.setVelocity(0, 0);
      this.state = 'idle';
      return;
    } else {
      this.freezeGfx.setAlpha(0);
    }

    this.x = this.container.x;
    this.y = this.container.y;

    // AI: Chase or idle
    if (dist < this.aggroRange) {
      this.state = 'chase';
      const spd = this.speed;
      this.physics.setVelocity(
        (dx / dist) * spd,
        (dy / dist) * spd
      );

      // Attack range
      if (dist < this.attackRange) {
        this.physics.setVelocity(0, 0);
        this.state = 'attack';
        if (time - this.lastAttack > this.attackCd) {
          this.lastAttack = time;
          return true; // Signal: attack player
        }
      }
    } else {
      // Idle wander
      this.state = 'idle';
      this.idleDirTimer -= 16;
      if (this.idleDirTimer <= 0) {
        this.idleDirTimer = Helpers.randInt(1000, 3000);
        if (Helpers.chance(0.6)) {
          const angle = Math.random() * Math.PI * 2;
          this.idleDirX = Math.cos(angle) * (this.speed * 0.3);
          this.idleDirY = Math.sin(angle) * (this.speed * 0.3);
        } else {
          this.idleDirX = 0;
          this.idleDirY = 0;
        }
      }
      this.physics.setVelocity(this.idleDirX, this.idleDirY);
    }

    return false;
  }

  die() {
    this.isDead = true;
    this.physics.setVelocity(0, 0);

    // Death animation
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 0.1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });

    // Drop loot
    const loot = Helpers.generateLoot(this.type);
    return { exp: this.exp, gold: this.gold, loot, x: this.container.x, y: this.container.y };
  }

  destroy() {
    if (this.container) this.container.destroy();
    this.isDead = true;
  }
}
