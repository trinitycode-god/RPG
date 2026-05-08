// =============================================
// SHADOWREALM ONLINE - MINIMAP
// =============================================

const Minimap = {
  canvas: null,
  ctx: null,
  scale: 0.15,

  init() {
    this.canvas = document.getElementById('minimap');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
  },

  update(player, enemies, npcs) {
    if (!this.ctx || !player) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const s = this.scale;
    const TILE = CONSTANTS.TILE_SIZE;
    
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);
    
    // Draw zones as colored blocks
    const zones = [
      { x: 5, y: 5, w: 40, h: 40, color: '#224422', name: 'Town' },
      { x: 50, y: 5, w: 60, h: 80, color: '#112211', name: 'Forest' },
      { x: 5, y: 50, w: 40, h: 60, color: '#110011', name: 'Dungeon' },
      { x: 110, y: 50, w: 40, h: 40, color: '#221100', name: 'Arena' },
    ];
    
    zones.forEach(zone => {
      ctx.fillStyle = zone.color;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    });
    
    // Border
    ctx.strokeStyle = '#334';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);
    
    // Player position on minimap
    const px = (player.x / (CONSTANTS.WORLD_WIDTH * TILE)) * w;
    const py = (player.y / (CONSTANTS.WORLD_HEIGHT * TILE)) * h;
    
    // Draw enemies
    if (enemies) {
      enemies.forEach(e => {
        if (!e || e.isDead) return;
        const ex = (e.x / (CONSTANTS.WORLD_WIDTH * TILE)) * w;
        const ey = (e.y / (CONSTANTS.WORLD_HEIGHT * TILE)) * h;
        ctx.fillStyle = '#FF4422';
        ctx.fillRect(ex - 1, ey - 1, 2, 2);
      });
    }
    
    // Draw NPCs
    if (npcs) {
      npcs.forEach(n => {
        if (!n) return;
        const nx = (n.x / (CONSTANTS.WORLD_WIDTH * TILE)) * w;
        const ny = (n.y / (CONSTANTS.WORLD_HEIGHT * TILE)) * h;
        ctx.fillStyle = '#FFFF44';
        ctx.fillRect(nx - 1, ny - 1, 2, 2);
      });
    }
    
    // Draw player (larger, bright)
    ctx.fillStyle = '#44AAFF';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Minimap legend
    ctx.fillStyle = '#88AACC';
    ctx.font = '7px monospace';
    ctx.fillText('● Você', 5, h - 5);
  }
};

// =============================================
// SHADOWREALM ONLINE - NOTIFICATIONS
// =============================================

const Notifications = {
  queue: [],
  showing: false,

  show(message, type = '') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const el = document.createElement('div');
    el.className = 'notification ' + type;
    el.textContent = message;
    container.appendChild(el);
    
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  },

  levelUp(level) {
    this.show(`⬆ LEVEL UP! Nível ${level}!`, 'levelup');
    // Flash the screen
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,200,0,0.2);pointer-events:none;z-index:1000;animation:notifIn 0.5s ease-out forwards;';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  },

  rankUp(rank) {
    this.show(`★ RANK UP! Rank ${rank}!`, 'rank');
  },

  itemFound(item) {
    const rarity = item.rarity || 'common';
    this.show(`${item.icon} ${item.name} encontrado!`, 'item');
  }
};
