// =============================================
// SHADOWREALM ONLINE - NPC ENTITY
// =============================================

class NPC {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name = config.name || 'NPC';
    this.role = config.role || 'townsperson';
    this.dialog = config.dialog || ['Olá, aventureiro!'];
    this.shop = config.shop || null;
    this.dialogIndex = 0;
    this.interactRange = 60;

    this.createSprite();
  }

  createSprite() {
    const scene = this.scene;
    this.container = scene.add.container(this.x, this.y);

    this.gfx = scene.add.graphics();
    this.drawNPC();
    this.container.add(this.gfx);

    // Name tag
    this.nameText = scene.add.text(0, -28, this.name, {
      fontSize: '10px', fill: '#FFD700', fontFamily: 'Rajdhani',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 1);
    this.container.add(this.nameText);

    // Role tag
    this.roleText = scene.add.text(0, -18, '[' + this.role + ']', {
      fontSize: '9px', fill: '#AAAAFF', fontFamily: 'Rajdhani',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 1);
    this.container.add(this.roleText);

    // Interaction hint (hidden by default)
    this.hintText = scene.add.text(0, -38, '[ F ] Conversar', {
      fontSize: '9px', fill: '#FFFFFF', fontFamily: 'Rajdhani',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 1).setAlpha(0);
    this.container.add(this.hintText);

    // Floating arrow animation
    scene.tweens.add({
      targets: this.hintText,
      y: this.hintText.y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawNPC() {
    const g = this.gfx;
    g.clear();

    // Color sets per role
    const roleColors = {
      merchant: { body: 0x884422, armor: 0xAA6633, hair: 0xFFCC44 },
      blacksmith: { body: 0x442222, armor: 0x666666, hair: 0x332200 },
      innkeeper: { body: 0x445588, armor: 0x335577, hair: 0xCC8844 },
      quest: { body: 0x224488, armor: 0x3366AA, hair: 0xFFFFAA },
      townsperson: { body: 0x556644, armor: 0x445533, hair: 0x886633 },
      guard: { body: 0x334466, armor: 0x888888, hair: 0x222222 }
    };
    const c = roleColors[this.role] || roleColors.townsperson;

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, 14, 18, 5);

    // Legs
    g.fillStyle(c.armor);
    g.fillRect(-5, 7, 4, 8);
    g.fillRect(1, 7, 4, 8);

    // Boots
    g.fillStyle(0x332211);
    g.fillRect(-6, 13, 5, 3);
    g.fillRect(1, 13, 5, 3);

    // Body
    g.fillStyle(c.armor);
    g.fillRect(-6, -1, 12, 10);
    g.fillStyle(c.body, 0.6);
    g.fillRect(-5, 0, 10, 8);

    // Arms
    g.fillStyle(0xFFCC99);
    g.fillRect(-9, 0, 4, 8);
    g.fillRect(5, 0, 4, 8);

    // Head
    g.fillStyle(0xFFCC99);
    g.fillRect(-5, -11, 10, 10);

    // Hair
    g.fillStyle(c.hair);
    g.fillRect(-6, -13, 12, 5);

    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(-2, -8, 2, 2);
    g.fillRect(1, -8, 2, 2);

    // Role-specific props
    if (this.role === 'merchant') {
      // Bag
      g.fillStyle(0xAA7733);
      g.fillCircle(-11, 4, 6);
      g.fillStyle(0x886622);
      g.fillRect(-14, 2, 6, 8);
    } else if (this.role === 'blacksmith') {
      // Hammer
      g.fillStyle(0x666666);
      g.fillRect(7, -5, 3, 16);
      g.fillStyle(0x444444);
      g.fillRect(5, -8, 7, 5);
    } else if (this.role === 'quest') {
      // Scroll
      g.fillStyle(0xEEDDAA);
      g.fillRect(6, -2, 5, 8);
      g.fillStyle(0xCCBB99);
      g.fillRect(5, -3, 7, 2);
      g.fillRect(5, 8, 7, 2);
      // Exclamation mark above
      g.fillStyle(0xFFDD00);
      g.fillRect(-1, -20, 3, 8);
      g.fillCircle(0, -9, 2);
    } else if (this.role === 'guard') {
      // Spear
      g.fillStyle(0x888888);
      g.fillRect(8, -18, 2, 28);
      g.fillStyle(0xCCCCDD);
      g.fillTriangle(7, -18, 9, -18, 9, -25);
      // Shield
      g.fillStyle(0x556677);
      g.fillRect(-13, -5, 7, 12);
      g.fillStyle(0x778899);
      g.fillRect(-12, -4, 5, 10);
    }
  }

  showHint(visible) {
    if (this.hintText) {
      this.scene.tweens.add({
        targets: this.hintText,
        alpha: visible ? 1 : 0,
        duration: 200
      });
    }
  }

  interact(player) {
    const dlg = this.dialog[this.dialogIndex % this.dialog.length];
    this.dialogIndex++;

    HUD.addChat(this.name, dlg);

    // Shop interaction
    if (this.shop && this.dialogIndex % this.dialog.length === 0) {
      this.openShop();
    }

    // Bob animation on interact
    this.scene.tweens.add({
      targets: this.container,
      y: this.container.y - 5,
      duration: 150,
      yoyo: true,
      ease: 'Bounce'
    });
  }

  openShop() {
    if (!this.shop) return;
    // Populate shop with items for sale
    HUD.addChat(this.name, 'Aqui estão meus itens à venda!');

    this.shop.forEach(itemId => {
      const item = ITEMS_DB[itemId];
      if (item) {
        const price = { common: 10, uncommon: 30, rare: 100, epic: 300, legendary: 1000 }[item.rarity] || 20;
        HUD.addChat(this.name, `${item.icon} ${item.name} — ${price}🪙`);
      }
    });
  }

  update(playerX, playerY) {
    const dx = playerX - this.container.x;
    const dy = playerY - this.container.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.showHint(dist < this.interactRange);
    this.x = this.container.x;
    this.y = this.container.y;
  }
}
