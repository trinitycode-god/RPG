// =============================================
// SHADOWREALM ONLINE - BOOT SCENE
// =============================================

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate all textures procedurally using canvas
    this.generateTextures();
  }

  generateTextures() {
    // ---- TILES ----
    this.createTile('tile_grass', (ctx) => {
      ctx.fillStyle = '#1A3311';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#1E3D13';
      ctx.fillRect(1, 1, 30, 30);
      // Grass details
      for (let i = 0; i < 8; i++) {
        const gx = Math.floor(Math.random() * 28) + 2;
        const gy = Math.floor(Math.random() * 28) + 2;
        ctx.fillStyle = '#254A18';
        ctx.fillRect(gx, gy, 2, 3);
        ctx.fillStyle = '#2D5C1E';
        ctx.fillRect(gx + 1, gy - 1, 1, 2);
      }
    });

    this.createTile('tile_grass2', (ctx) => {
      ctx.fillStyle = '#1C3812';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#223F16';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillRect(16, 16, 16, 16);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#2A4E1C';
        ctx.fillRect(Math.floor(Math.random() * 30) + 1, Math.floor(Math.random() * 30) + 1, 2, 2);
      }
    });

    this.createTile('tile_dirt', (ctx) => {
      ctx.fillStyle = '#4A3020';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5A3A28';
      ctx.fillRect(2, 2, 28, 28);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = '#3E2818';
        ctx.fillRect(Math.floor(Math.random() * 28) + 2, Math.floor(Math.random() * 28) + 2, 3, 2);
      }
    });

    this.createTile('tile_stone', (ctx) => {
      ctx.fillStyle = '#333344';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#3A3A4A';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillRect(17, 1, 14, 14);
      ctx.fillRect(1, 17, 14, 14);
      ctx.fillRect(17, 17, 14, 14);
      ctx.fillStyle = '#2A2A3A';
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 0, 1, 32);
      ctx.fillRect(15, 0, 2, 32);
      ctx.fillRect(0, 15, 32, 2);
    });

    this.createTile('tile_dark', (ctx) => {
      ctx.fillStyle = '#0A0A14';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#0D0D18';
      ctx.fillRect(2, 2, 28, 28);
      // Purple cracks
      ctx.strokeStyle = '#220033';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(5, 5); ctx.lineTo(15, 12);
      ctx.moveTo(20, 8); ctx.lineTo(28, 20);
      ctx.moveTo(3, 20); ctx.lineTo(12, 28);
      ctx.stroke();
    });

    this.createTile('tile_water', (ctx) => {
      ctx.fillStyle = '#112244';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#1A3366';
      ctx.fillRect(0, 8, 32, 8);
      ctx.fillRect(0, 24, 32, 8);
      ctx.fillStyle = '#4488AA';
      ctx.fillRect(4, 10, 10, 2);
      ctx.fillRect(18, 26, 8, 2);
      ctx.fillStyle = '#224466';
      ctx.fillRect(0, 16, 32, 2);
    });

    this.createTile('tile_wall', (ctx) => {
      ctx.fillStyle = '#222233';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#2A2A44';
      ctx.fillRect(2, 2, 28, 13);
      ctx.fillRect(2, 17, 28, 13);
      ctx.fillStyle = '#1A1A2A';
      ctx.fillRect(0, 15, 32, 2);
      ctx.fillRect(16, 2, 2, 13);
      ctx.fillRect(8, 17, 2, 13);
    });

    this.createTile('tile_floor', (ctx) => {
      ctx.fillStyle = '#1A1A28';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#222236';
      ctx.fillRect(1, 1, 30, 30);
      ctx.fillStyle = '#2A2A40';
      ctx.fillRect(4, 4, 24, 24);
      ctx.strokeStyle = '#181830';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 4, 24, 24);
    });

    this.createTile('tile_sand', (ctx) => {
      ctx.fillStyle = '#554422';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#665533';
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(80,60,30,0.4)`;
        ctx.fillRect(Math.random() * 30, Math.random() * 30, 2, 1);
      }
    });

    this.createTile('tile_arena', (ctx) => {
      ctx.fillStyle = '#332211';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#443322';
      ctx.fillRect(2, 2, 28, 28);
      // Arena markings
      ctx.strokeStyle = '#664422';
      ctx.lineWidth = 1;
      if (Math.random() < 0.1) {
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    this.createTile('tile_path', (ctx) => {
      ctx.fillStyle = '#3A2E1E';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#4A3828';
      ctx.fillRect(2, 0, 28, 32);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#3E3020';
        ctx.fillRect(Math.floor(Math.random() * 28) + 2, Math.floor(Math.random() * 30), 3, 2);
      }
    });

    // ---- OBJECTS ----
    this.createObject('tree', 40, 60, (ctx) => {
      // Trunk
      ctx.fillStyle = '#4A3020';
      ctx.fillRect(16, 35, 8, 25);
      // Leaves (layered)
      ctx.fillStyle = '#1A4A10';
      ctx.beginPath(); ctx.ellipse(20, 28, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#224A14';
      ctx.beginPath(); ctx.ellipse(20, 18, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2A5C18';
      ctx.beginPath(); ctx.ellipse(20, 10, 10, 9, 0, 0, Math.PI * 2); ctx.fill();
      // Highlight
      ctx.fillStyle = '#3A7020';
      ctx.beginPath(); ctx.ellipse(16, 8, 4, 4, 0, 0, Math.PI * 2); ctx.fill();
    });

    this.createObject('rock', 32, 24, (ctx) => {
      ctx.fillStyle = '#333344';
      ctx.beginPath(); ctx.ellipse(16, 16, 14, 10, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#444455';
      ctx.beginPath(); ctx.ellipse(13, 12, 8, 6, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#555566';
      ctx.beginPath(); ctx.ellipse(11, 10, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    });

    this.createObject('building_house', 96, 80, (ctx) => {
      // Walls
      ctx.fillStyle = '#664433';
      ctx.fillRect(8, 30, 80, 50);
      // Roof
      ctx.fillStyle = '#442200';
      ctx.beginPath();
      ctx.moveTo(4, 30); ctx.lineTo(48, 4); ctx.lineTo(92, 30);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#553311';
      ctx.beginPath();
      ctx.moveTo(4, 30); ctx.lineTo(48, 8); ctx.lineTo(92, 30);
      ctx.lineTo(88, 30); ctx.lineTo(48, 12); ctx.lineTo(8, 30);
      ctx.closePath(); ctx.fill();
      // Door
      ctx.fillStyle = '#221100';
      ctx.fillRect(34, 48, 16, 22);
      ctx.fillStyle = '#332211';
      ctx.fillRect(35, 49, 14, 20);
      // Windows
      ctx.fillStyle = '#FFEEAA';
      ctx.fillRect(14, 38, 16, 14);
      ctx.fillRect(66, 38, 16, 14);
      ctx.fillStyle = '#CCCC88';
      ctx.fillRect(14, 45, 16, 1);
      ctx.fillRect(22, 38, 1, 14);
      ctx.fillRect(66, 45, 16, 1);
      ctx.fillRect(74, 38, 1, 14);
    });

    this.createObject('dungeon_entrance', 80, 60, (ctx) => {
      ctx.fillStyle = '#111122';
      ctx.fillRect(0, 0, 80, 60);
      ctx.fillStyle = '#0A0A18';
      ctx.beginPath();
      ctx.moveTo(20, 55); ctx.lineTo(20, 25); ctx.arc(40, 25, 20, Math.PI, 0); ctx.lineTo(60, 55);
      ctx.closePath(); ctx.fill();
      // Stone frame
      ctx.strokeStyle = '#444466';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(18, 57); ctx.lineTo(18, 25); ctx.arc(40, 25, 22, Math.PI, 0); ctx.lineTo(62, 57);
      ctx.stroke();
      // Purple glow inside
      ctx.fillStyle = 'rgba(80,0,120,0.3)';
      ctx.beginPath();
      ctx.moveTo(22, 55); ctx.lineTo(22, 25); ctx.arc(40, 25, 18, Math.PI, 0); ctx.lineTo(58, 55);
      ctx.closePath(); ctx.fill();
      // Sign
      ctx.fillStyle = '#332200';
      ctx.fillRect(28, 4, 24, 12);
      ctx.fillStyle = '#FFAA00';
      ctx.font = '7px serif';
      ctx.fillText('DUNGEON', 29, 13);
    });

    this.createObject('chest', 24, 20, (ctx) => {
      ctx.fillStyle = '#663300';
      ctx.fillRect(2, 10, 20, 10);
      ctx.fillStyle = '#884422';
      ctx.fillRect(2, 6, 20, 6);
      // Lid top
      ctx.fillStyle = '#773311';
      ctx.fillRect(1, 5, 22, 3);
      // Metal bands
      ctx.fillStyle = '#AA8800';
      ctx.fillRect(2, 13, 20, 2);
      ctx.fillRect(10, 5, 4, 15);
      // Lock
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(10, 13, 4, 4);
      ctx.fillStyle = '#BB9900';
      ctx.fillRect(11, 12, 2, 2);
    });

    this.createObject('sign', 20, 32, (ctx) => {
      // Post
      ctx.fillStyle = '#4A3020';
      ctx.fillRect(8, 16, 4, 16);
      // Board
      ctx.fillStyle = '#664422';
      ctx.fillRect(2, 4, 16, 14);
      ctx.fillStyle = '#553311';
      ctx.fillRect(3, 5, 14, 12);
    });

    // Spawn points as invisible markers
    this.textures.on('addtexture', () => {});
  }

  createTile(key, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);
    this.textures.addCanvas(key, canvas);
  }

  createObject(key, w, h, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);
    this.textures.addCanvas(key, canvas);
  }

  create() {
    this.scene.start('GameScene');
  }
}
