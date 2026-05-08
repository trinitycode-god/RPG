// =============================================
// SHADOWREALM ONLINE - GAME SCENE
// =============================================

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.enemies = [];
    this.npcs = [];
    this.spawnTimers = {};
    this.effectsGroup = null;
    this.projectiles = [];
    this.clones = [];
    this.shadowSoldiers = [];
    this.lootDrops = [];
    this.currentZone = 'town';
    this.frameCount = 0;
  }

  create() {
    const W = CONSTANTS.WORLD_WIDTH * CONSTANTS.TILE_SIZE;
    const H = CONSTANTS.WORLD_HEIGHT * CONSTANTS.TILE_SIZE;

    // World bounds
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    // Build the world map
    this.buildWorld(W, H);

    // Create player
    this.createPlayer();

    // Create NPCs
    this.createNPCs();

    // Spawn initial enemies
    this.spawnEnemies();

    // Camera follow player
    this.cameras.main.startFollow(this.player.container, true, 0.08, 0.08);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Effects layer
    this.effectsGroup = this.add.group();

    // NPC interact key
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.interactKey.on('down', () => this.tryInteractNPC());

    // Dungeon enter key
    this.dungeonKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.dungeonKey.on('down', () => this.tryEnterDungeon());

    // Store scene reference globally
    GameState.scene = this;

    // Minimap init
    Minimap.init();

    // HUD init
    HUD.updateBars();
    HUD.renderSkillBar();
    HUD.renderPortrait();
    HUD.updateZone(CONSTANTS.ZONES.town.name);

    // Enemy respawn timer
    this.time.addEvent({
      delay: 8000,
      callback: this.respawnEnemies,
      callbackScope: this,
      loop: true
    });

    // Loot sparkle
    this.time.addEvent({
      delay: 500,
      callback: this.updateLootDrops,
      callbackScope: this,
      loop: true
    });

    // MP regen tick
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.player && !this.player.isDead) {
          this.player.mp = Math.min(this.player.maxMp, this.player.mp + 5);
          HUD.updateBars();
        }
      },
      loop: true
    });

    console.log('[GameScene] World created successfully!');
  }

  buildWorld(W, H) {
    const T = CONSTANTS.TILE_SIZE;

    // Layer 1: Base ground
    this.groundLayer = this.add.group();

    // Fill everything with forest/dark
    for (let x = 0; x < CONSTANTS.WORLD_WIDTH; x++) {
      for (let y = 0; y < CONSTANTS.WORLD_HEIGHT; y++) {
        let tileKey;
        const wx = x * T, wy = y * T;

        // Town zone (top-left)
        if (x < 25 && y < 25) tileKey = 'tile_dirt';
        // Forest (right and middle)
        else if (x > 10 && x < 80 && y > 5 && y < 80) tileKey = Math.random() < 0.3 ? 'tile_grass2' : 'tile_grass';
        // Dungeon zone (bottom-left)
        else if (x < 30 && y > 40 && y < 80) tileKey = Math.random() < 0.5 ? 'tile_dark' : 'tile_floor';
        // Arena (right side)
        else if (x > 90 && y > 40 && y < 80) tileKey = 'tile_arena';
        // Water borders
        else if (x === 0 || y === 0 || x >= CONSTANTS.WORLD_WIDTH - 1 || y >= CONSTANTS.WORLD_HEIGHT - 1) tileKey = 'tile_water';
        else tileKey = 'tile_grass';

        try {
          const tile = this.add.image(wx + T / 2, wy + T / 2, tileKey).setDepth(-10);
          if (!tile.texture || tile.texture.key === '__MISSING') {
            tile.destroy();
          }
        } catch (e) { /* skip */ }
      }
    }

    // Town area: stone paths
    this.drawPath(5, 5, 20, 5);
    this.drawPath(12, 5, 12, 20);

    // Decorations
    this.placeDecoration();

    // Portals / zone transitions
    this.createPortals();
  }

  drawPath(x1, y1, x2, y2) {
    const T = CONSTANTS.TILE_SIZE;
    if (x1 === x2) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        try { this.add.image(x1 * T + T / 2, y * T + T / 2, 'tile_path').setDepth(-9); } catch (e) { }
      }
    } else {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        try { this.add.image(x * T + T / 2, y1 * T + T / 2, 'tile_path').setDepth(-9); } catch (e) { }
      }
    }
  }

  placeDecoration() {
    const T = CONSTANTS.TILE_SIZE;

    // Town buildings
    const buildings = [
      { x: 3, y: 3, key: 'building_house' },
      { x: 10, y: 3, key: 'building_house' },
      { x: 3, y: 12, key: 'building_house' },
      { x: 15, y: 10, key: 'building_house' },
    ];
    buildings.forEach(b => {
      try {
        this.add.image(b.x * T + 48, b.y * T + 40, b.key).setDepth(1);
      } catch (e) { }
    });

    // Signs
    [[8, 5], [12, 3], [15, 5]].forEach(([x, y]) => {
      try { this.add.image(x * T + T / 2, y * T + T / 2, 'sign').setDepth(1); } catch (e) { }
    });

    // Dungeon entrance
    try {
      this.dungeonEntrance = this.add.image(12 * T, 45 * T, 'dungeon_entrance').setDepth(2);
      this.add.text(12 * T, 43 * T, '[G] Entrar na Dungeon', {
        fontSize: '10px', fill: '#AA88FF', fontFamily: 'Rajdhani',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 1).setDepth(3);
    } catch (e) { }

    // Forest trees
    const treePositions = [];
    for (let i = 0; i < 80; i++) {
      const tx = Helpers.randInt(15, 75);
      const ty = Helpers.randInt(5, 75);
      // Avoid town area
      if (tx < 22 && ty < 22) continue;
      treePositions.push([tx, ty]);
    }
    treePositions.forEach(([tx, ty]) => {
      try { this.add.image(tx * T + T / 2, ty * T + T / 2, 'tree').setDepth(2); } catch (e) { }
    });

    // Rocks
    for (let i = 0; i < 30; i++) {
      const rx = Helpers.randInt(5, 90);
      const ry = Helpers.randInt(5, 90);
      if (rx < 22 && ry < 22) continue;
      try { this.add.image(rx * T + T / 2, ry * T + T / 2, 'rock').setDepth(1); } catch (e) { }
    }

    // Chests
    this.chestPositions = [[20, 15], [35, 30], [8, 50], [60, 20], [45, 55]];
    this.chestPositions.forEach(([cx, cy]) => {
      try {
        const chest = this.add.image(cx * T + T / 2, cy * T + T / 2, 'chest').setDepth(2).setInteractive();
        chest.on('pointerdown', () => this.openChest(chest, cx, cy));
        chest.on('pointerover', () => chest.setTint(0xFFD700));
        chest.on('pointerout', () => chest.clearTint());
      } catch (e) { }
    });
  }

  createPortals() {
    const T = CONSTANTS.TILE_SIZE;
    // Arena portal
    this.arenaPortal = this.createPortalEffect(92 * T, 55 * T, 0xFF4400, 'Arena PvP');
    // Forest deep zone indicator
    this.forestZoneIndicator = this.add.text(50 * T, 5 * T, '⚔ Floresta Sombria', {
      fontSize: '14px', fill: '#44FF88', fontFamily: 'Cinzel', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
  }

  createPortalEffect(x, y, color, label) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(color, 0.3);
    g.fillCircle(x, y, 25);
    g.lineStyle(3, color, 0.8);
    g.strokeCircle(x, y, 25);

    this.add.text(x, y - 30, label, {
      fontSize: '11px', fill: '#FFFFFF', fontFamily: 'Cinzel', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(6);

    // Animate portal
    this.tweens.add({
      targets: g,
      alpha: { from: 0.6, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    return g;
  }

  createPlayer() {
    const T = CONSTANTS.TILE_SIZE;
    const startX = 12 * T;
    const startY = 10 * T;

    this.player = new Player(this, startX, startY, GameState.playerClass || 'warrior');
    GameState.player = this.player;
  }

  createNPCs() {
    const T = CONSTANTS.TILE_SIZE;

    const npcConfigs = [
      {
        x: 7 * T, y: 8 * T,
        config: {
          name: 'Mercador Dorin',
          role: 'merchant',
          dialog: [
            'Olá, aventureiro! Tenho os melhores itens!',
            'Acabei de receber novas poções de HP.',
            'Compre antes que acabe o estoque!',
            'Que os deuses te protejam, herói!'
          ],
          shop: ['hp_potion', 'mp_potion', 'elixir', 'iron_sword', 'leather_armor']
        }
      },
      {
        x: 14 * T, y: 7 * T,
        config: {
          name: 'Ferreiro Brak',
          role: 'blacksmith',
          dialog: [
            'Forge suas armas aqui!',
            'Tenho espadas, arcos e cajados.',
            'Traga materiais raros para forjar itens lendários!',
            'A melhor ferraria do reino!'
          ],
          shop: ['iron_sword', 'iron_plate', 'iron_helm', 'hunters_bow', 'thunder_staff']
        }
      },
      {
        x: 9 * T, y: 15 * T,
        config: {
          name: 'Estalajadeiro Gus',
          role: 'innkeeper',
          dialog: [
            'Bem-vindo! Quer descansar?',
            'Por aqui você recupera HP e MP completamente!',
            'As criaturas estão mais ativas ultimamente...',
            'Cuidado na floresta à noite!'
          ]
        }
      },
      {
        x: 16 * T, y: 14 * T,
        config: {
          name: 'Guardião Ren',
          role: 'quest',
          dialog: [
            '[MISSÃO] Elimine 5 Goblins na floresta!',
            'Há relatos de um Orc poderoso ao norte.',
            'A dungeon ao sul está cheia de perigos...',
            'Traga a cabeça do Cavaleiro Sombrio e te recompensarei!',
            'Os monstros estão ficando mais fortes. Tome cuidado!'
          ]
        }
      },
      {
        x: 5 * T, y: 18 * T,
        config: {
          name: 'Sábia Elara',
          role: 'quest',
          dialog: [
            'Os cristais sombrios estão se espalhando...',
            'Solo Leveling é real aqui. Evolua seu Rank!',
            'Os clones de chakra são poderosos — domine-os!',
            'Capture criaturas com Núcleo de Monstro.',
            'Quanto mais você luta, mais forte fica!'
          ]
        }
      },
      {
        x: 11 * T, y: 20 * T,
        config: {
          name: 'Guarda Tomas',
          role: 'guard',
          dialog: [
            'Halt! Identifique-se!',
            '... ah, é você. Pode passar.',
            'Fique em alerta. Há movimentos estranhos.',
            'A dungeon ao sul foi lacrada. Entre por sua conta.'
          ]
        }
      }
    ];

    npcConfigs.forEach(({ x, y, config }) => {
      const npc = new NPC(this, x, y, config);
      this.npcs.push(npc);
    });
  }

  spawnEnemies() {
    const T = CONSTANTS.TILE_SIZE;

    // Forest enemies
    const forestEnemies = [
      { type: 'slime', x: 25, y: 15 }, { type: 'slime', x: 30, y: 20 },
      { type: 'slime', x: 35, y: 12 }, { type: 'goblin', x: 28, y: 25 },
      { type: 'goblin', x: 40, y: 18 }, { type: 'goblin', x: 45, y: 30 },
      { type: 'wolf', x: 50, y: 15 }, { type: 'wolf', x: 55, y: 35 },
      { type: 'orc', x: 60, y: 20 }, { type: 'orc', x: 65, y: 40 },
      { type: 'slime', x: 38, y: 45 }, { type: 'wolf', x: 42, y: 50 },
      { type: 'goblin', x: 70, y: 25 }, { type: 'wolf', x: 72, y: 40 },
    ];

    forestEnemies.forEach(({ type, x, y }) => {
      const jitterX = Helpers.randInt(-2, 2) * T;
      const jitterY = Helpers.randInt(-2, 2) * T;
      const enemy = new Enemy(this, x * T + jitterX, y * T + jitterY, type);
      this.enemies.push(enemy);
    });
  }

  respawnEnemies() {
    const T = CONSTANTS.TILE_SIZE;
    // Remove dead enemies, respawn some
    this.enemies = this.enemies.filter(e => e && !e.isDead);

    if (this.enemies.length < 10) {
      const spawnTypes = ['slime', 'goblin', 'wolf', 'orc', 'skeleton'];
      const type = Helpers.randFrom(spawnTypes);
      const x = Helpers.randInt(25, 70) * T;
      const y = Helpers.randInt(10, 70) * T;
      const enemy = new Enemy(this, x, y, type);
      this.enemies.push(enemy);
    }
  }

  openChest(chestObj, cx, cy) {
    if (chestObj.opened) return;
    chestObj.opened = true;
    chestObj.setTint(0x666666);

    // Generate loot
    const lootType = Helpers.randFrom(['goblin', 'skeleton', 'orc', 'wolf']);
    const loot = Helpers.generateLoot(lootType);

    // Give extra gold
    const bonusGold = Helpers.randInt(20, 80);
    if (this.player) this.player.gold += bonusGold;
    HUD.addLog(`Baú aberto! +${bonusGold} ouro!`, 'loot');
    Notifications.show(`📦 Baú! +${bonusGold}🪙`, 'item');

    loot.forEach(item => {
      if (item.type !== 'currency') {
        InventorySystem.addItem(item);
        Notifications.itemFound(item);
      }
    });

    // Sparkle effect
    for (let i = 0; i < 8; i++) {
      const spark = this.add.graphics().setDepth(10);
      spark.fillStyle(0xFFD700);
      spark.fillCircle(0, 0, 3);
      spark.x = cx * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2;
      spark.y = cy * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2;

      const angle = (i / 8) * Math.PI * 2;
      this.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * 30,
        y: spark.y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => spark.destroy()
      });
    }
  }

  tryInteractNPC() {
    if (!this.player) return;
    const px = this.player.container.x;
    const py = this.player.container.y;

    for (const npc of this.npcs) {
      const dx = npc.container.x - px;
      const dy = npc.container.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < npc.interactRange) {
        npc.interact(this.player);
        break;
      }
    }
  }

  tryEnterDungeon() {
    if (!this.player) return;
    const px = this.player.container.x;
    const py = this.player.container.y;
    const T = CONSTANTS.TILE_SIZE;
    const dx = 12 * T - px;
    const dy = 45 * T - py;
    if (Math.sqrt(dx * dx + dy * dy) < 80) {
      this.scene.start('DungeonScene');
    }
  }

  // ---- SKILL EFFECTS ----
  useSkill(key, skillDef) {
    if (!this.player || this.player.isDead) return;

    const px = this.player.container.x;
    const py = this.player.container.y;

    switch (skillDef.type) {
      case 'melee':
        this.skillMeleeSlash(px, py, skillDef);
        break;
      case 'projectile':
        this.skillProjectile(px, py, skillDef);
        break;
      case 'aoe':
        this.skillAoE(px, py, skillDef);
        break;
      case 'dash':
        this.skillDash(skillDef);
        break;
      case 'buff':
        this.skillBuff(skillDef);
        break;
      case 'teleport':
        this.skillTeleport();
        break;
      case 'stealth':
        this.skillStealth(skillDef);
        break;
      case 'clone':
        this.skillClone(px, py, skillDef);
        break;
      case 'drain':
        this.skillDrain(px, py, skillDef);
        break;
      case 'summon':
        this.skillSummon(px, py, skillDef);
        break;
      case 'beam':
        this.skillBeam(px, py, skillDef);
        break;
      case 'multishot':
        this.skillMultishot(px, py, skillDef);
        break;
      case 'backflip':
        this.skillBackflip();
        break;
      case 'meteor':
        this.skillMeteor(px, py, skillDef);
        break;
      case 'pet':
        PetSystem.summonPet(this, this.player);
        break;
    }
  }

  skillMeleeSlash(px, py, skillDef) {
    // Visual slash arc
    const g = this.add.graphics().setDepth(20);
    g.lineStyle(4, 0xFFCCCC, 0.9);
    g.beginPath();
    g.arc(px, py, 40, -0.5, 1.5);
    g.strokePath();
    g.fillStyle(0xFF6644, 0.3);
    g.fillCircle(px, py, 40);

    this.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() });

    // Damage nearby enemies
    this.damageEnemiesInRange(px, py, skillDef.range || 60, skillDef.damage, skillDef.effect);
  }

  skillProjectile(px, py, skillDef) {
    const pointer = this.input.activePointer;
    const worldX = this.cameras.main.scrollX + pointer.x;
    const worldY = this.cameras.main.scrollY + pointer.y;
    const dx = worldX - px;
    const dy = worldY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;

    // Determine color/style by effect
    const isFire = skillDef.effect === 'burn';
    const color = isFire ? 0xFF4400 : 0x4444FF;
    const trailColor = isFire ? 0xFF8800 : 0x88AAFF;

    const g = this.add.graphics().setDepth(20);
    g.fillStyle(color);
    g.fillCircle(0, 0, isFire ? 10 : 7);
    if (isFire) {
      g.fillStyle(0xFF8800, 0.5);
      g.fillCircle(0, 0, 14);
    }
    g.x = px;
    g.y = py;

    const speed = 300;
    const range = skillDef.range || 250;
    const duration = (range / speed) * 1000;

    this.tweens.add({
      targets: g,
      x: px + nx * range,
      y: py + ny * range,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        // Check collision with enemies during flight
        for (const enemy of this.enemies) {
          if (!enemy || enemy.isDead) continue;
          const ex = enemy.container.x;
          const ey = enemy.container.y;
          const d = Helpers.dist(g.x, g.y, ex, ey);
          if (d < 25) {
            this.hitEnemy(enemy, skillDef.damage, skillDef.effect);
            // Explosion effect
            this.createExplosion(g.x, g.y, isFire ? 0xFF4400 : 0x4488FF, isFire ? 40 : 30);
            g.destroy();
            return;
          }
        }
      },
      onComplete: () => {
        this.createExplosion(g.x, g.y, color, 25);
        g.destroy();
      }
    });
  }

  skillAoE(px, py, skillDef) {
    const pointer = this.input.activePointer;
    const targetX = this.cameras.main.scrollX + pointer.x;
    const targetY = this.cameras.main.scrollY + pointer.y;
    const range = skillDef.range || 100;

    // Wind-up indicator
    const indicator = this.add.graphics().setDepth(15);
    indicator.lineStyle(2, 0xFF8800, 0.7);
    indicator.strokeCircle(targetX, targetY, range);
    indicator.fillStyle(0xFF4400, 0.15);
    indicator.fillCircle(targetX, targetY, range);

    this.tweens.add({
      targets: indicator,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      onComplete: () => {
        indicator.destroy();
        // Impact
        this.createExplosion(targetX, targetY, 0xFF2200, range);
        this.damageEnemiesInRange(targetX, targetY, range, skillDef.damage, skillDef.effect);
        HUD.addLog(`AoE! Área de ${range}px`, 'crit');
      }
    });
  }

  skillDash(skillDef) {
    const pointer = this.input.activePointer;
    const worldX = this.cameras.main.scrollX + pointer.x;
    const worldY = this.cameras.main.scrollY + pointer.y;
    const px = this.player.container.x;
    const py = this.player.container.y;
    const dx = worldX - px;
    const dy = worldY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dashDist = Math.min(skillDef.range || 200, dist);
    const nx = dx / dist;
    const ny = dy / dist;

    // Trail effect
    for (let i = 0; i < 5; i++) {
      const trail = this.add.graphics().setDepth(19).setAlpha(0.5 - i * 0.08);
      trail.fillStyle(0xAADDFF, 0.4);
      trail.fillCircle(px + nx * i * 30, py + ny * i * 30, 10);
      this.tweens.add({ targets: trail, alpha: 0, duration: 300, onComplete: () => trail.destroy() });
    }

    // Move player
    this.tweens.add({
      targets: this.player.container,
      x: px + nx * dashDist,
      y: py + ny * dashDist,
      duration: 200,
      ease: 'Power3'
    });

    // Damage enemies along path
    this.damageEnemiesInRange(px + nx * dashDist / 2, py + ny * dashDist / 2, 50, skillDef.damage, null);
  }

  skillBuff(skillDef) {
    if (!this.player) return;
    const buff = skillDef.buff;

    this.player.buffAtk = buff.atk || 1.0;
    this.player.recalcStats();
    HUD.addLog(`Buff: ATQ +${Math.round((buff.atk - 1) * 100)}% por ${buff.duration / 1000}s!`, 'heal');

    // Aura effect
    const g = this.add.graphics().setDepth(18);
    g.fillStyle(0xFF6600, 0.3);
    g.fillCircle(this.player.container.x, this.player.container.y, 30);
    this.tweens.add({
      targets: g, alpha: 0, scaleX: 2, scaleY: 2,
      duration: buff.duration, onComplete: () => {
        g.destroy();
        this.player.buffAtk = 1.0;
        this.player.recalcStats();
        HUD.addLog('Buff expirou.', 'system');
      }
    });
  }

  skillTeleport() {
    const pointer = this.input.activePointer;
    const targetX = this.cameras.main.scrollX + pointer.x;
    const targetY = this.cameras.main.scrollY + pointer.y;

    // Ghost effect at origin
    const ghost = this.add.graphics().setDepth(18).setAlpha(0.5);
    ghost.fillStyle(0x8844FF, 0.5);
    ghost.fillRect(-8, -14, 16, 26);
    ghost.x = this.player.container.x;
    ghost.y = this.player.container.y;
    this.tweens.add({ targets: ghost, alpha: 0, duration: 500, onComplete: () => ghost.destroy() });

    // Teleport
    this.player.container.x = targetX;
    this.player.container.y = targetY;

    // Arrival effect
    this.createExplosion(targetX, targetY, 0xAA44FF, 30);
  }

  skillStealth(skillDef) {
    if (!this.player) return;
    this.player.stealthed = true;
    this.player.drawSprite();
    HUD.addLog('Entrou nas sombras... invisível!', 'system');
    Notifications.show('🌑 Invisível!', '');

    setTimeout(() => {
      if (this.player) {
        this.player.stealthed = false;
        this.player.drawSprite();
        HUD.addLog('Saiu das sombras.', 'system');
      }
    }, skillDef.duration || 3000);
  }

  skillClone(px, py, skillDef) {
    const count = skillDef.count || 3;
    HUD.addLog(`Kage Bunshin! ${count} clones criados!`, 'crit');
    Notifications.show(`👥 ${count} Clones!`, '');

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const cx = px + Math.cos(angle) * 40;
      const cy = py + Math.sin(angle) * 40;

      const clone = this.add.graphics().setDepth(16).setAlpha(0.7);
      clone.fillStyle(0x6688AA);
      clone.fillRect(-6, -10, 12, 20);
      clone.fillCircle(0, -12, 7);
      clone.x = cx;
      clone.y = cy;
      this.clones.push(clone);

      // Clone auto-attacks nearby enemies
      const cloneInterval = setInterval(() => {
        if (!clone.active) { clearInterval(cloneInterval); return; }
        const nearest = this.findNearestEnemy(clone.x, clone.y, 100);
        if (nearest) {
          this.hitEnemy(nearest, skillDef.damage, null);
          // Attack flash
          clone.setAlpha(1);
          setTimeout(() => { if (clone.active) clone.setAlpha(0.7); }, 100);
        }
      }, 800);

      // Despawn after duration
      this.time.delayedCall(skillDef.duration || 6000, () => {
        clearInterval(cloneInterval);
        this.tweens.add({
          targets: clone,
          alpha: 0, scaleX: 0, scaleY: 0,
          duration: 300,
          onComplete: () => {
            clone.destroy();
            this.clones = this.clones.filter(c => c !== clone);
          }
        });
      });
    }
  }

  skillDrain(px, py, skillDef) {
    // Hit nearest enemy with lifesteal
    const nearest = this.findNearestEnemy(px, py, skillDef.range || 80);
    if (!nearest) {
      HUD.addLog('Nenhum inimigo no alcance!', 'system');
      return;
    }

    const dmgResult = CombatSystem.calcDamage(this.player, nearest, skillDef.damage);
    if (dmgResult.type !== 'miss') {
      CombatSystem.applyDamage(nearest, dmgResult.amount, dmgResult.type);
      const healed = CombatSystem.applyLifesteal(this.player, dmgResult.amount, 0.5);
      HUD.addLog(`Drenou ${dmgResult.amount} HP! Recuperou ${healed} HP!`, 'heal');
      nearest.updateHPBar();

      // Visual drain line
      const g = this.add.graphics().setDepth(20);
      g.lineStyle(3, 0x8800AA, 0.8);
      g.lineBetween(px, py, nearest.container.x, nearest.container.y);
      g.lineStyle(2, 0xFF00FF, 0.5);
      g.lineBetween(nearest.container.x, nearest.container.y, px, py);
      this.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: () => g.destroy() });

      if (nearest.isDead || nearest.hp <= 0) {
        nearest.isDead = true;
        this.handleEnemyDeath(nearest);
      }
    }
    HUD.updateBars();
  }

  skillSummon(px, py, skillDef) {
    const count = skillDef.count || 5;
    HUD.addLog(`Exército das Sombras! ${count} soldados invocados!`, 'crit');
    Notifications.show(`⚔️ Exército das Sombras!`, 'rank');

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const sx = px + Math.cos(angle) * 50;
      const sy = py + Math.sin(angle) * 50;

      const soldier = this.add.graphics().setDepth(16);
      soldier.fillStyle(0x220033);
      soldier.fillRect(-5, -12, 10, 22);
      soldier.fillCircle(0, -14, 7);
      soldier.fillStyle(0xAA00FF, 0.5);
      soldier.fillRect(-6, -13, 12, 24);
      soldier.x = sx;
      soldier.y = sy;
      this.shadowSoldiers.push(soldier);

      // Shadow soldier attacks nearby enemies
      const soldierInterval = setInterval(() => {
        if (!soldier.active) { clearInterval(soldierInterval); return; }
        const nearest = this.findNearestEnemy(soldier.x, soldier.y, 120);
        if (nearest) {
          const dmg = Math.round((this.player?.atk || 10) * (skillDef.damage || 1.0));
          nearest.hp -= dmg;
          if (nearest.hp <= 0) {
            nearest.isDead = true;
            this.handleEnemyDeath(nearest);
          } else {
            nearest.updateHPBar();
          }
          HUD.addLog(`Sombra: -${dmg} HP`, 'dmg');
          // Move toward enemy
          const tx = nearest.container.x;
          const ty = nearest.container.y;
          const ddx = tx - soldier.x;
          const ddy = ty - soldier.y;
          const dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd > 40) {
            soldier.x += (ddx / dd) * 30;
            soldier.y += (ddy / dd) * 30;
          }
        }
      }, 1200);

      this.time.delayedCall(skillDef.duration || 10000, () => {
        clearInterval(soldierInterval);
        this.tweens.add({
          targets: soldier, alpha: 0, duration: 400,
          onComplete: () => {
            soldier.destroy();
            this.shadowSoldiers = this.shadowSoldiers.filter(s => s !== soldier);
          }
        });
      });
    }
  }

  skillBeam(px, py, skillDef) {
    const pointer = this.input.activePointer;
    const worldX = this.cameras.main.scrollX + pointer.x;
    const worldY = this.cameras.main.scrollY + pointer.y;
    const dx = worldX - px;
    const dy = worldY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;
    const range = skillDef.range || 200;

    const g = this.add.graphics().setDepth(20);
    g.lineStyle(8, 0x44AAFF, 0.9);
    g.lineBetween(px, py, px + nx * range, py + ny * range);
    g.lineStyle(3, 0xAAFFFF, 0.7);
    g.lineBetween(px, py, px + nx * range, py + ny * range);

    // Damage all enemies along beam
    let hitCount = 0;
    this.enemies.forEach(e => {
      if (!e || e.isDead) return;
      const ex = e.container.x - px;
      const ey = e.container.y - py;
      const proj = ex * nx + ey * ny;
      if (proj > 0 && proj < range) {
        const perpDist = Math.abs(ex * ny - ey * nx);
        if (perpDist < 20) {
          this.hitEnemy(e, skillDef.damage, null);
          hitCount++;
        }
      }
    });

    HUD.addLog(`Raio atingiu ${hitCount} inimigos!`, hitCount > 0 ? 'crit' : 'dmg');
    this.tweens.add({ targets: g, alpha: 0, duration: 600, onComplete: () => g.destroy() });
  }

  skillMultishot(px, py, skillDef) {
    const pointer = this.input.activePointer;
    const worldX = this.cameras.main.scrollX + pointer.x;
    const worldY = this.cameras.main.scrollY + pointer.y;
    const baseAngle = Math.atan2(worldY - py, worldX - px);
    const count = skillDef.count || 3;
    const spread = 0.3;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i - Math.floor(count / 2)) * spread;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const range = skillDef.range || 300;

      const arrow = this.add.graphics().setDepth(20);
      arrow.fillStyle(0xCCAA88);
      arrow.fillRect(-12, -1, 24, 2);
      arrow.fillStyle(0x886644);
      arrow.fillTriangle(12, -4, 12, 4, 18, 0);
      arrow.x = px;
      arrow.y = py;
      arrow.rotation = angle;

      this.tweens.add({
        targets: arrow,
        x: px + nx * range,
        y: py + ny * range,
        duration: 400,
        ease: 'Linear',
        onUpdate: () => {
          for (const enemy of this.enemies) {
            if (!enemy || enemy.isDead) continue;
            if (Helpers.dist(arrow.x, arrow.y, enemy.container.x, enemy.container.y) < 20) {
              this.hitEnemy(enemy, skillDef.damage, skillDef.effect);
              arrow.destroy();
              return;
            }
          }
        },
        onComplete: () => arrow.destroy()
      });
    }
  }

  skillBackflip() {
    if (!this.player) return;
    const pointer = this.input.activePointer;
    const worldX = this.cameras.main.scrollX + pointer.x;
    const worldY = this.cameras.main.scrollY + pointer.y;
    const px = this.player.container.x;
    const py = this.player.container.y;
    // Flip away from cursor
    const dx = px - worldX;
    const dy = py - worldY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;

    HUD.addLog('Body Flicker!', 'crit');

    // Trail
    for (let i = 0; i < 4; i++) {
      const trail = this.add.graphics().setDepth(18).setAlpha(0.5);
      trail.fillStyle(0x44FF88, 0.4);
      trail.fillRect(-5, -12, 10, 22);
      trail.x = px + nx * i * 15;
      trail.y = py + ny * i * 15;
      this.tweens.add({ targets: trail, alpha: 0, duration: 300, onComplete: () => trail.destroy() });
    }

    this.tweens.add({
      targets: this.player.container,
      x: px + nx * 120,
      y: py + ny * 120,
      duration: 150,
      ease: 'Power3'
    });
  }

  skillMeteor(px, py, skillDef) {
    const pointer = this.input.activePointer;
    const targetX = this.cameras.main.scrollX + pointer.x;
    const targetY = this.cameras.main.scrollY + pointer.y;

    // Charging indicator
    const ring = this.add.graphics().setDepth(18);
    ring.lineStyle(3, 0xFF4400, 0.8);
    ring.strokeCircle(targetX, targetY, 60);

    const meteor = this.add.graphics().setDepth(25);
    meteor.fillStyle(0xFF2200, 0.9);
    meteor.fillCircle(0, 0, 20);
    meteor.fillStyle(0xFF8800, 0.6);
    meteor.fillCircle(0, 0, 30);
    meteor.x = targetX;
    meteor.y = targetY - 300;

    HUD.addLog('☄️ Meteoro Negro! Aguarde...', 'crit');

    this.tweens.add({
      targets: meteor,
      y: targetY,
      duration: 800,
      ease: 'Power3',
      onComplete: () => {
        ring.destroy();
        meteor.destroy();
        this.createExplosion(targetX, targetY, 0xFF2200, 80);
        this.createExplosion(targetX, targetY, 0xFF8800, 60);
        this.damageEnemiesInRange(targetX, targetY, skillDef.range || 150, skillDef.damage, null);
        HUD.addLog('☄️ IMPACTO DO METEORO!', 'crit');

        // Screen shake
        this.cameras.main.shake(400, 0.02);
      }
    });
  }

  // ---- DAMAGE HELPERS ----
  hitEnemy(enemy, damageMultiplier, effect) {
    if (!enemy || enemy.isDead || !this.player) return;

    const result = CombatSystem.calcDamage(this.player, enemy, damageMultiplier);
    if (result.type === 'miss') return;

    CombatSystem.applyDamage(enemy, result.amount, result.type);
    if (effect) CombatSystem.applySkillEffect(effect, enemy, this.player);

    enemy.updateHPBar();

    // Show damage number
    const cam = this.cameras.main;
    const sx = enemy.container.x - cam.scrollX;
    const sy = enemy.container.y - cam.scrollY;
    Helpers.showDamageNumber(sx, sy - 20, result.amount, result.type);

    HUD.addLog(`-${result.amount}${result.type === 'crit' ? ' CRÍTICO!' : ''}`, result.type === 'crit' ? 'crit' : 'dmg');

    if (enemy.isDead || enemy.hp <= 0) {
      enemy.isDead = true;
      this.handleEnemyDeath(enemy);
    }
  }

  damageEnemiesInRange(cx, cy, range, damageMultiplier, effect) {
    let hitCount = 0;
    this.enemies.forEach(enemy => {
      if (!enemy || enemy.isDead) return;
      const ex = enemy.container.x;
      const ey = enemy.container.y;
      if (Helpers.dist(cx, cy, ex, ey) < range) {
        this.hitEnemy(enemy, damageMultiplier, effect);
        hitCount++;
      }
    });
    return hitCount;
  }

  findNearestEnemy(x, y, maxRange) {
    let nearest = null;
    let nearestDist = maxRange;
    this.enemies.forEach(e => {
      if (!e || e.isDead) return;
      const d = Helpers.dist(x, y, e.container.x, e.container.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    });
    return nearest;
  }

  handleEnemyDeath(enemy) {
    const result = enemy.die();
    if (!result) return;

    this.enemies = this.enemies.filter(e => e !== enemy);

    // Give EXP
    if (this.player) {
      this.player.gainExp(result.exp);
      this.player.gold += result.gold;
      GameState.playerGold = this.player.gold;
      HUD.addLog(`+${result.exp} EXP | +${result.gold}🪙`, 'loot');
    }

    // Give pet EXP
    if (GameState.activePet) {
      GameState.activePet.gainExp(Math.round(result.exp * 0.5));
    }

    // Loot items
    result.loot.forEach(item => {
      if (item.type === 'currency') {
        // Already added as gold
      } else if (item.type !== 'currency') {
        if (InventorySystem.addItem(item)) {
          Notifications.itemFound(item);
        }
      }
    });

    HUD.updateBars();
  }

  createExplosion(x, y, color, radius) {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(color, 0.7);
    g.fillCircle(x, y, radius * 0.5);
    g.fillStyle(color, 0.3);
    g.fillCircle(x, y, radius);

    this.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      ease: 'Power2',
      onComplete: () => g.destroy()
    });

    // Particles
    for (let i = 0; i < 6; i++) {
      const p = this.add.graphics().setDepth(21);
      p.fillStyle(color);
      p.fillCircle(0, 0, Helpers.randInt(2, 5));
      p.x = x;
      p.y = y;
      const angle = Math.random() * Math.PI * 2;
      const spd = Helpers.randFloat(40, 100);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * spd,
        y: y + Math.sin(angle) * spd,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  updateLootDrops() {
    // Animate existing loot sparkles
    this.lootDrops = this.lootDrops.filter(l => l && l.active);
  }

  detectZone() {
    if (!this.player) return;
    const px = this.player.container.x;
    const py = this.player.container.y;
    const T = CONSTANTS.TILE_SIZE;

    let zone = 'forest';
    if (px < 25 * T && py < 25 * T) zone = 'town';
    else if (px < 30 * T && py > 40 * T) zone = 'dungeon';
    else if (px > 90 * T && py > 40 * T) zone = 'arena';

    if (zone !== this.currentZone) {
      this.currentZone = zone;
      const zoneDef = CONSTANTS.ZONES[zone];
      HUD.updateZone(zoneDef ? zoneDef.name : 'Zona Desconhecida');
    }
  }

  update(time, delta) {
    this.frameCount++;

    if (!this.player || !this.player.container) return;

    // Update player
    this.player.update(this.cursors, this.wasd, this.input.activePointer, time);

    // Auto-attack nearest enemy
    if (this.frameCount % 3 === 0) {
      const nearest = this.findNearestEnemy(
        this.player.container.x,
        this.player.container.y,
        this.player.attackRange
      );
      if (nearest && !this.player.isDead) {
        if (this.player.autoAttack(nearest)) {
          if (nearest.isDead || nearest.hp <= 0) {
            nearest.isDead = true;
            this.handleEnemyDeath(nearest);
          } else {
            nearest.updateHPBar();
          }
        }
      }
    }

    // Update enemies
    const px = this.player.container.x;
    const py = this.player.container.y;

    this.enemies.forEach(enemy => {
      if (!enemy || enemy.isDead) return;
      const attacked = enemy.update(px, py, time);
      if (attacked && !this.player.isDead) {
        // Enemy attacks player
        const result = CombatSystem.calcDamage(enemy, this.player);
        if (result.type !== 'miss') {
          this.player.hp = Math.max(0, this.player.hp - result.amount);
          HUD.addLog(`${enemy.name} causou -${result.amount} HP!`, 'dmg');
          HUD.updateBars();

          // Screen flash on damage
          if (result.amount > 10) {
            this.cameras.main.flash(100, 200, 0, 0, false);
          }

          if (this.player.hp <= 0) this.player.die();
        }
      }
    });

    // Update NPCs
    this.npcs.forEach(npc => npc.update(px, py));

    // Update pet
    if (GameState.activePet && !GameState.activePet.isDead) {
      GameState.activePet.update(time, this.enemies);
    }

    // Minimap update (every 10 frames)
    if (this.frameCount % 10 === 0) {
      Minimap.update(this.player, this.enemies, this.npcs);
    }

    // Zone detection (every 30 frames)
    if (this.frameCount % 30 === 0) {
      this.detectZone();
      HUD.updateBars();
    }
  }
}
