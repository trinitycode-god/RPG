// =============================================
// SHADOWREALM ONLINE - MAIN ENTRY POINT
// =============================================

// ---- GLOBAL GAME STATE ----
const GameState = {
  playerName: 'Herói',
  playerClass: 'warrior',
  playerLevel: 1,
  playerExp: 0,
  playerHp: null,
  playerMp: null,
  playerGold: 0,
  skillPoints: 0,
  scene: null,
  player: null,
  activePet: null,
  currentMount: null,
  characters: [null, null, null], // Save slots
  selectedSlot: 0,
  currentUser: 'Player'
};

// ---- PHASER CONFIG ----
let phaserGame = null;

function createPhaserGame() {
  if (phaserGame) { phaserGame.destroy(true); }

  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#050510',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [BootScene, GameScene, DungeonScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  });
}

// ---- SCREEN MANAGEMENT ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    if (id === 'game-screen') screen.style.display = 'block';
  }
}

// ---- LOGIN SCREEN ----
function initLoginScreen() {
  ParticlesSystem.init('particles');

  document.getElementById('login-btn').addEventListener('click', () => {
    const name = document.getElementById('username-input').value.trim() || 'Herói';
    GameState.currentUser = name;
    GameState.playerName = name;
    showCharSelect();
  });

  document.getElementById('register-btn').addEventListener('click', () => {
    const name = document.getElementById('username-input').value.trim() || 'Aventureiro';
    GameState.currentUser = name;
    alert(`Bem-vindo, ${name}! Conta criada com sucesso!`);
    document.getElementById('login-btn').click();
  });

  // Enter key to login
  document.getElementById('username-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('password-input').focus();
  });
  document.getElementById('password-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
}

// ---- CHARACTER SELECT ----
function showCharSelect() {
  showScreen('char-select-screen');
  renderCharSlots();
}

function renderCharSlots() {
  const slots = document.querySelectorAll('.char-slot');
  slots.forEach((slot, i) => {
    const char = GameState.characters[i];
    const canvas = document.getElementById(`char-canvas-${i}`);
    const info = slot.querySelector('.char-info');

    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 80, 100);
      if (char) {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 80, 100);
        Helpers.drawCharacter(ctx, 40, 75, char.classType, 1.0);
      } else {
        ctx.fillStyle = '#0A0A14';
        ctx.fillRect(0, 0, 80, 100);
        ctx.fillStyle = '#333';
        ctx.font = '30px serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', 40, 58);
      }
    }

    if (info && char) {
      info.querySelector('.char-name').textContent = char.name;
      info.querySelector('.char-class').textContent = char.classType.toUpperCase();
      info.querySelector('.char-level').textContent = `Nível ${char.level}`;
    } else if (info) {
      info.querySelector('.char-name').textContent = 'Sem personagem';
      info.querySelector('.char-class').textContent = '-';
      info.querySelector('.char-level').textContent = '-';
    }
  });
}

function initCharSelect() {
  document.querySelectorAll('.char-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.char-slot').forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      GameState.selectedSlot = parseInt(slot.dataset.slot);
    });
  });

  document.getElementById('enter-world-btn').addEventListener('click', () => {
    const slot = GameState.selectedSlot;
    const char = GameState.characters[slot];
    if (char) {
      loadCharacter(char);
      enterGame();
    } else {
      alert('Crie um personagem primeiro!');
      showCharCreate();
    }
  });

  document.getElementById('create-char-btn').addEventListener('click', showCharCreate);
  document.getElementById('back-to-login-btn').addEventListener('click', () => showScreen('login-screen'));
}

function loadCharacter(char) {
  GameState.playerName = char.name;
  GameState.playerClass = char.classType;
  GameState.playerLevel = char.level || 1;
  GameState.playerExp = char.exp || 0;
  GameState.playerGold = char.gold || 0;
  GameState.playerHp = null; // Will init to max
  GameState.playerMp = null;
  GameState.skillPoints = char.skillPoints || 0;
  SkillsSystem.initPlayer(char.classType);
}

// ---- CHARACTER CREATION ----
let selectedClass = 'warrior';

function showCharCreate() {
  showScreen('char-create-screen');
  drawCreationPreview();
}

function drawCreationPreview() {
  const canvas = document.getElementById('creation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 150, 200);
  ctx.fillStyle = '#0A0A14';
  ctx.fillRect(0, 0, 150, 200);

  // Grid bg
  ctx.strokeStyle = '#1A1A28';
  ctx.lineWidth = 1;
  for (let i = 0; i < 150; i += 10) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 200); ctx.stroke();
  }
  for (let i = 0; i < 200; i += 10) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(150, i); ctx.stroke();
  }

  Helpers.drawCharacter(ctx, 75, 145, selectedClass, 2.0);
}

function initCharCreate() {
  document.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedClass = card.dataset.class;
      drawCreationPreview();
    });
  });

  document.getElementById('confirm-create-btn').addEventListener('click', () => {
    const name = document.getElementById('char-name-input').value.trim();
    if (!name) {
      alert('Digite um nome para o personagem!');
      return;
    }
    if (name.length < 3) {
      alert('Nome muito curto! Mínimo 3 caracteres.');
      return;
    }

    const char = {
      name: name,
      classType: selectedClass,
      level: 1,
      exp: 0,
      gold: 50,
      skillPoints: 0,
      created: Date.now()
    };

    GameState.characters[GameState.selectedSlot] = char;
    loadCharacter(char);
    showCharSelect();
    Notifications.show(`✨ ${name} criado!`, 'item');
  });

  document.getElementById('cancel-create-btn').addEventListener('click', showCharSelect);
}

// ---- ENTER GAME ----
function enterGame() {
  showScreen('game-screen');

  // Init systems
  InventorySystem.init();
  SkillsSystem.initPlayer(GameState.playerClass);
  GameState.skillPoints = GameState.skillPoints || 0;

  // Give starter mount after delay
  setTimeout(() => {
    if (!GameState.currentMount) {
      GameState.currentMount = 'horse';
      const mountBtn = document.getElementById('mount-btn');
      if (mountBtn) mountBtn.textContent = '🐎';
    }
  }, 5000);

  // Start Phaser game
  setTimeout(() => {
    createPhaserGame();
    HUD.init();
    Minimap.init();
  }, 100);

  // Window resize handler
  window.addEventListener('resize', () => {
    if (phaserGame) {
      phaserGame.scale.resize(window.innerWidth, window.innerHeight);
    }
  });
}

// ---- INITIALIZE ----
document.addEventListener('DOMContentLoaded', () => {
  console.log('[ShadowRealm] Initializing...');

  initLoginScreen();
  initCharSelect();
  initCharCreate();

  // Default: show login
  showScreen('login-screen');

  console.log('[ShadowRealm] Ready! v1.0.0');
  console.log('Controls: WASD/Arrows = Move | Q,W,E,R = Skills | F = Interact | I = Inventory | K = Skill Tree | M = Mount | G = Enter Dungeon | ESC = Exit Dungeon');
});

// ---- AUTO-SAVE ----
setInterval(() => {
  if (GameState.player && GameState.playerClass) {
    const slot = GameState.selectedSlot;
    if (GameState.characters[slot]) {
      GameState.characters[slot].level = GameState.playerLevel;
      GameState.characters[slot].exp = GameState.playerExp;
      GameState.characters[slot].gold = GameState.playerGold;
      GameState.characters[slot].skillPoints = GameState.skillPoints;
    }
  }
}, 30000);
