// =============================================
// SHADOWREALM ONLINE - DUNGEON SCENE
// =============================================

class DungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DungeonScene' });
    this.player = null;
    this.enemies = [];
    this.roomCleared = false;
    this.waveNumber = 0;
    this.bossSpawned = false;
    this.frameCount = 0;
  }

  create() {
    const W = 50 * CONSTANTS.TILE_SIZE;
    const H = 40 * CONSTANTS.TILE_SIZE;

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor('#050510');

    this.buildDungeon(W, H);
    this.createPlayer();
    this.spawnFirstWave();

    this.cameras.main.startFollow(this.player.container, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Exit key
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
      this.exitDungeon();
    });

    GameState.scene = this;

    // Dungeon header
    HUD.updateZone('⚔ Dungeon Amaldiçoada');
    HUD.addLog('Entrou na Dungeon! [ESC] para sair.', 'system');
    Notifications.show('⚔ Dungeon! Sobreviva!', 'rank');

    // Wave timer
    this.waveTimer = this.time.addEvent({
      delay: 15000,
      callback: this.nextWave,
      callbackScope: this,
      loop: true
    });
  }

  buildDungeon(W, H) {
    const T = CONSTANTS.TILE_SIZE;

    // Floor
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 40; y++) {
        try {
          this.add.image(x * T + T / 2, y * T + T / 2,
            Math.random() < 0.2 ? 'tile_dark' : 'tile_floor'
          ).setDepth(-10);
        } catch (e) { }
      }
    }

    // Walls around perimeter
    for (let x = 0; x < 50; x++) {
      try {
        this.add.image(x * T + T / 2, T / 2, 'tile_wall').setDepth(1);
        this.add.image(x * T + T / 2, 39 * T + T / 2, 'tile_wall').setDepth(1);
      } catch (e) { }
    }
    for (let y = 0; y < 40; y++) {
      try {
        this.add.image(T / 2, y * T + T / 2, 'tile_wall').setDepth(1);
        this.add.image(49 * T + T / 2, y * T + T / 2, 'tile_wall').setDepth(1);
      } catch (e) { }
    }

    // Inner wall columns for cover
    const pillars = [
      [8, 8], [8, 20], [8, 32],
      [20, 8], [20, 20], [20, 32],
      [32, 8], [32, 20], [32, 32],
      [40, 14], [40, 26]
    ];
    pillars.forEach(([px, py]) => {
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 3; dy++) {
          try {
            this.add.image((px + dx) * T + T / 2, (py + dy) * T + T / 2, 'tile_wall').setDepth(1);
          } catch (e) { }
        }
      }
    });

    // Purple atmospheric glow orbs
    for (let i = 0; i < 8; i++) {
      const g = this.add.graphics().setDepth(0);
      const x = Helpers.randInt(5, 45) * T;
      const y = Helpers.randInt(3, 37) * T;
      g.fillStyle(0x4400AA, 0.15);
      g.fillCircle(x, y, 60);
      g.lineStyle(2, 0x6600CC, 0.3);
      g.strokeCircle(x, y, 60);

      this.tweens.add({
        targets: g,
        alpha: { from: 0.3, to: 0.8 },
        duration: Helpers.randInt(1500, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // Boss room marker (far end)
    const bossG = this.add.graphics().setDepth(2);
    bossG.fillStyle(0xFF0000, 0.1);
    bossG.fillRect(38 * T, 15 * T, 10 * T, 10 * T);
    bossG.lineStyle(3, 0xFF0000, 0.5);
    bossG.strokeRect(38 * T, 15 * T, 10 * T, 10 * T);

    this.add.text(43 * T, 14 * T, '💀 BOSS', {
      fontSize: '14px', fill: '#FF0000', fontFamily: 'Cinzel',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(3);

    // Exit marker
    this.add.text(3 * T, 2 * T, '[ESC] Sair', {
      fontSize: '10px', fill: '#AAAAFF', fontFamily: 'Rajdhani',
      stroke: '#000', strokeThickness: 2
    }).setDepth(5);
  }

  createPlayer() {
    const T = CONSTANTS.TILE_SIZE;
    this.player = new Player(this, 5 * T, 5 * T, GameState.playerClass || 'warrior');
    this.player.hp = GameState.playerHp || this.player.maxHp;
    this.player.mp = GameState.playerMp || this.player.maxMp;
    GameState.player = this.player;
  }

  spawnFirstWave() {
    this.waveNumber = 1;
    this.spawnWave(this.waveNumber);
    HUD.addLog(`Onda ${this.waveNumber} começou!`, 'system');
  }

  spawnWave(wave) {
    const T = CONSTANTS.TILE_SIZE;
    const count = 3 + wave * 2;
    const types = ['skeleton', 'orc', 'dark_knight'];

    for (let i = 0; i < count; i++) {
      const type = Helpers.randFrom(types.slice(0, Math.min(wave, types.length)));
      const x = Helpers.randInt(10, 45) * T;
      const y = Helpers.randInt(5, 35) * T;
      const enemy = new Enemy(this, x, y, type);
      // Scale with wave
      enemy.maxHp = Math.round(enemy.maxHp * (1 + wave * 0.3));
      enemy.hp = enemy.maxHp;
      enemy.atk = Math.round(enemy.atk * (1 + wave * 0.2));
      this.enemies.push(enemy);
    }
  }

  nextWave() {
    this.enemies = this.enemies.filter(e => e && !e.isDead);

    if (this.enemies.length === 0) {
      this.waveNumber++;
      if (this.waveNumber >= 4 && !this.bossSpawned) {
        this.spawnBoss();
      } else if (!this.bossSpawned) {
        this.spawnWave(this.waveNumber);
        HUD.addLog(`Onda ${this.waveNumber} começou!`, 'system');
        Notifications.show(`⚔ Onda ${this.waveNumber}!`, '');
      }
    }
  }

  spawnBoss() {
    const T = CONSTANTS.TILE_SIZE;
    this.bossSpawned = true;

    const boss = new Enemy(this, 43 * T, 20 * T, 'dragon');
    boss.maxHp *= 1.5;
    boss.hp = boss.maxHp;
    this.enemies.push(boss);

    HUD.addLog('🐉 BOSS APARECEU! O Dragão das Sombras!', 'crit');
    Notifications.show('🐉 BOSS! Dragão das Sombras!', 'rank');
    this.cameras.main.shake(500, 0.03);

    // Boss music effect (visual)
    const flash = this.add.graphics().setDepth(100);
    flash.fillStyle(0xFF0000, 0.3);
    flash.fillRect(0, 0, 50 * T, 40 * T);
    this.tweens.add({ targets: flash, alpha: 0, duration: 1000, onComplete: () => flash.destroy() });
  }

  exitDungeon() {
    HUD.addLog('Saiu da Dungeon.', 'system');
    // Save state
    if (this.player) {
      GameState.playerHp = this.player.hp;
      GameState.playerMp = this.player.mp;
    }
    this.scene.start('GameScene');
  }

  handleEnemyDeath(enemy) {
    const result = enemy.die();
    if (!result) return;
    this.enemies = this.enemies.filter(e => e !== enemy);

    if (this.player) {
      this.player.gainExp(Math.round(result.exp * 1.5)); // Dungeon EXP bonus
      this.player.gold += result.gold;
      HUD.addLog(`+${Math.round(result.exp * 1.5)} EXP (dungeon)`, 'loot');
    }

    result.loot.forEach(item => {
      if (item.type !== 'currency') {
        InventorySystem.addItem(item);
        Notifications.itemFound(item);
      }
    });

    // Check if all dead
    setTimeout(() => {
      const alive = this.enemies.filter(e => e && !e.isDead);
      if (alive.length === 0 && !this.roomCleared) {
        this.roomCleared = true;
        if (this.bossSpawned) {
          HUD.addLog('🏆 BOSS DERROTADO! Dungeon completa!', 'crit');
          Notifications.show('🏆 DUNGEON COMPLETA!', 'rank');
          this.cameras.main.shake(800, 0.04);
          // Big reward
          if (this.player) {
            this.player.gainExp(500);
            this.player.gold += 200;
            InventorySystem.addItem({ ...ITEMS_DB.shadow_crystal, id: 'shadow_crystal', count: 1 });
            InventorySystem.addItem({ ...ITEMS_DB.shadow_blade, id: 'shadow_blade', count: 1 });
          }
        } else {
          HUD.addLog('Sala limpa! Próxima onda em breve...', 'system');
        }
      }
    }, 1000);
  }

  useSkill(key, skillDef) {
    // Reuse GameScene skill logic
    if (!this.player || this.player.isDead) return;
    const gameScene = new GameScene();
    // Borrow skill methods by binding to this
    const methods = [
      'skillMeleeSlash', 'skillProjectile', 'skillAoE', 'skillDash',
      'skillBuff', 'skillTeleport', 'skillStealth', 'skillClone',
      'skillDrain', 'skillSummon', 'skillBeam', 'skillMultishot',
      'skillBackflip', 'skillMeteor', 'damageEnemiesInRange',
      'findNearestEnemy', 'hitEnemy', 'handleEnemyDeath', 'createExplosion'
    ];

    methods.forEach(m => {
      if (GameScene.prototype[m]) {
        this[m] = GameScene.prototype[m].bind(this);
      }
    });

    const px = this.player.container.x;
    const py = this.player.container.y;

    switch (skillDef.type) {
      case 'melee': this.skillMeleeSlash(px, py, skillDef); break;
      case 'projectile': this.skillProjectile(px, py, skillDef); break;
      case 'aoe': this.skillAoE(px, py, skillDef); break;
      case 'dash': this.skillDash(skillDef); break;
      case 'buff': this.skillBuff(skillDef); break;
      case 'teleport': this.skillTeleport(); break;
      case 'stealth': this.skillStealth(skillDef); break;
      case 'clone': this.skillClone(px, py, skillDef); break;
      case 'drain': this.skillDrain(px, py, skillDef); break;
      case 'summon': this.skillSummon(px, py, skillDef); break;
      case 'beam': this.skillBeam(px, py, skillDef); break;
      case 'multishot': this.skillMultishot(px, py, skillDef); break;
      case 'backflip': this.skillBackflip(); break;
      case 'meteor': this.skillMeteor(px, py, skillDef); break;
      case 'pet': PetSystem.summonPet(this, this.player); break;
    }
  }

  update(time, delta) {
    this.frameCount++;
    if (!this.player || !this.player.container) return;

    this.player.update(this.cursors, this.wasd, this.input.activePointer, time);

    // Borrow auto-attack from GameScene
    if (this.frameCount % 3 === 0) {
      let nearest = null;
      let nearestDist = this.player.attackRange;
      this.enemies.forEach(e => {
        if (!e || e.isDead) return;
        const d = Helpers.dist(this.player.container.x, this.player.container.y, e.container.x, e.container.y);
        if (d < nearestDist) { nearestDist = d; nearest = e; }
      });
      if (nearest && !this.player.isDead) {
        if (this.player.autoAttack(nearest)) {
          if (nearest.hp <= 0 || nearest.isDead) {
            nearest.isDead = true;
            this.handleEnemyDeath(nearest);
          } else {
            nearest.updateHPBar();
          }
        }
      }
    }

    const px = this.player.container.x;
    const py = this.player.container.y;

    this.enemies.forEach(enemy => {
      if (!enemy || enemy.isDead) return;
      const attacked = enemy.update(px, py, time);
      if (attacked && !this.player.isDead) {
        const result = CombatSystem.calcDamage(enemy, this.player);
        if (result.type !== 'miss') {
          this.player.hp = Math.max(0, this.player.hp - result.amount);
          HUD.addLog(`${enemy.name}: -${result.amount} HP!`, 'dmg');
          HUD.updateBars();
          this.cameras.main.flash(80, 180, 0, 0, false);
          if (this.player.hp <= 0) {
            this.player.die();
            setTimeout(() => this.exitDungeon(), 3500);
          }
        }
      }
    });

    if (GameState.activePet) {
      GameState.activePet.update(time, this.enemies);
    }

    if (this.frameCount % 10 === 0) {
      Minimap.update(this.player, this.enemies, []);
    }
    if (this.frameCount % 30 === 0) {
      HUD.updateBars();
    }
  }
}
