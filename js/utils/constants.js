// =============================================
// SHADOWREALM ONLINE - CONSTANTS
// =============================================

const CONSTANTS = {
  // World
  TILE_SIZE: 32,
  WORLD_WIDTH: 200,
  WORLD_HEIGHT: 200,
  CHUNK_SIZE: 16,

  // Player
  BASE_SPEED: 160,
  MOUNT_SPEED_BONUS: 1.8,
  BASE_HP: { warrior: 150, mage: 80, archer: 110, shadow: 90 },
  BASE_MP: { warrior: 60, mage: 150, archer: 100, shadow: 120 },
  BASE_ATK: { warrior: 18, mage: 25, archer: 20, shadow: 22 },
  BASE_DEF: { warrior: 12, mage: 4, archer: 7, shadow: 6 },

  // Rank system (Solo Leveling inspired)
  RANKS: ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'MONARCH'],
  RANK_COLORS: {
    'E': '#888888', 'D': '#44AA44', 'C': '#4488FF',
    'B': '#AA44FF', 'A': '#FF8800', 'S': '#FFD700',
    'SS': '#FF4444', 'SSS': '#FF00FF', 'MONARCH': '#FFFFFF'
  },
  RANK_LEVELS: [1, 10, 20, 35, 50, 70, 90, 110, 130],

  // EXP
  EXP_PER_LEVEL_BASE: 100,
  EXP_SCALE: 1.4,

  // Combat
  CRIT_CHANCE_BASE: 0.05,
  CRIT_MULTIPLIER: 2.0,
  MISS_CHANCE: 0.05,

  // Enemy types
  ENEMY_TYPES: {
    slime: {
      name: 'Slime', hp: 30, atk: 5, def: 2, exp: 12, gold: 3,
      color: 0x44FF88, size: 0.8, speed: 50, dropChance: 0.3
    },
    goblin: {
      name: 'Goblin', hp: 50, atk: 10, def: 4, exp: 25, gold: 8,
      color: 0x88CC44, size: 0.9, speed: 80, dropChance: 0.4
    },
    skeleton: {
      name: 'Esqueleto', hp: 70, atk: 14, def: 6, exp: 40, gold: 12,
      color: 0xCCCCCC, size: 1.0, speed: 65, dropChance: 0.45
    },
    wolf: {
      name: 'Lobo', hp: 90, atk: 18, def: 5, exp: 55, gold: 15,
      color: 0x886644, size: 1.1, speed: 100, dropChance: 0.4
    },
    orc: {
      name: 'Orc', hp: 130, atk: 22, def: 10, exp: 80, gold: 20,
      color: 0x228822, size: 1.3, speed: 60, dropChance: 0.5
    },
    dark_knight: {
      name: 'Cavaleiro Sombrio', hp: 250, atk: 35, def: 18, exp: 180, gold: 50,
      color: 0x220044, size: 1.4, speed: 70, dropChance: 0.7
    },
    dragon: {
      name: 'Dragão', hp: 1000, atk: 80, def: 40, exp: 1000, gold: 300,
      color: 0xFF2200, size: 2.0, speed: 80, dropChance: 0.95, boss: true
    }
  },

  // Zones
  ZONES: {
    town: { name: 'Cidade de Início', color: 0x334422, enemies: [], safe: true },
    forest: { name: 'Floresta Sombria', color: 0x1A3300, enemies: ['slime', 'goblin', 'wolf'] },
    dungeon: { name: 'Dungeon Amaldiçoada', color: 0x110011, enemies: ['skeleton', 'orc', 'dark_knight'] },
    arena: { name: 'Arena PvP', color: 0x221100, enemies: [], pvp: true }
  },

  // Items
  RARITIES: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  RARITY_COLORS: {
    common: '#AAAAAA', uncommon: '#44FF44',
    rare: '#4488FF', epic: '#AA44FF', legendary: '#FF8800'
  },
  RARITY_CHANCE: [0.50, 0.25, 0.15, 0.08, 0.02],

  // Pets
  PET_TYPES: {
    spirit_wolf: { name: 'Lobo Espiritual', rarity: 'uncommon', atk: 5, hp: 50, icon: '🐺', captureChance: 0.3 },
    fire_fox: { name: 'Raposa de Fogo', rarity: 'rare', atk: 12, hp: 40, icon: '🦊', captureChance: 0.15 },
    shadow_panther: { name: 'Pantera Sombria', rarity: 'epic', atk: 20, hp: 60, icon: '🐆', captureChance: 0.08 },
    storm_eagle: { name: 'Águia da Tempestade', rarity: 'rare', atk: 15, hp: 35, icon: '🦅', captureChance: 0.12 },
    dark_dragon: { name: 'Dragão Sombrio', rarity: 'legendary', atk: 40, hp: 100, icon: '🐉', captureChance: 0.02 }
  },

  // Mounts
  MOUNT_TYPES: {
    horse: { name: 'Cavalo', speedBonus: 1.5, icon: '🐎' },
    wolf: { name: 'Lobo de Guerra', speedBonus: 1.7, icon: '🐺' },
    tiger: { name: 'Tigre Mágico', speedBonus: 1.8, icon: '🐯' },
    dragon: { name: 'Dragão Montável', speedBonus: 2.2, icon: '🐉' }
  },

  // Colors
  COLOR_HP: 0xFF3322,
  COLOR_MP: 0x2244FF,
  COLOR_EXP: 0xFFAA00,
  COLOR_GOLD: 0xFFD700,
  COLOR_CRIT: 0xFFFF00,
  COLOR_MISS: 0xAAAAAA,
  COLOR_HEAL: 0x44FF88,
};

// Item database
const ITEMS_DB = {
  // Potions
  hp_potion: { name: 'Poção de HP', icon: '🧪', rarity: 'common', type: 'consumable', effect: 'heal_hp', value: 50, desc: 'Restaura 50 HP' },
  mp_potion: { name: 'Poção de Mana', icon: '💧', rarity: 'common', type: 'consumable', effect: 'heal_mp', value: 50, desc: 'Restaura 50 MP' },
  elixir: { name: 'Elixir Supremo', icon: '✨', rarity: 'rare', type: 'consumable', effect: 'heal_both', value: 200, desc: 'Restaura 200 HP e MP' },
  // Weapons
  iron_sword: { name: 'Espada de Ferro', icon: '⚔️', rarity: 'common', type: 'weapon', slot: 'weapon', atk: 8, desc: 'Uma espada simples mas confiável' },
  shadow_blade: { name: 'Lâmina das Sombras', icon: '🗡️', rarity: 'epic', type: 'weapon', slot: 'weapon', atk: 35, critChance: 0.15, desc: 'Lâmina forjada nas trevas' },
  thunder_staff: { name: 'Cajado do Trovão', icon: '🪄', rarity: 'rare', type: 'weapon', slot: 'weapon', atk: 28, mp: 30, desc: 'Amplifica magias poderosas' },
  hunters_bow: { name: 'Arco do Caçador', icon: '🏹', rarity: 'uncommon', type: 'weapon', slot: 'weapon', atk: 18, desc: 'Arco balanceado de caçador' },
  // Armor
  leather_armor: { name: 'Armadura de Couro', icon: '🛡️', rarity: 'common', type: 'armor', slot: 'armor', def: 5, desc: 'Proteção básica' },
  iron_plate: { name: 'Placa de Ferro', icon: '🦺', rarity: 'uncommon', type: 'armor', slot: 'armor', def: 12, desc: 'Sólida armadura de ferro' },
  shadow_cloak: { name: 'Manto das Sombras', icon: '🧥', rarity: 'epic', type: 'armor', slot: 'armor', def: 18, speed: 20, desc: 'Concede velocidade nas sombras' },
  // Helmets
  iron_helm: { name: 'Elmo de Ferro', icon: '🪖', rarity: 'common', type: 'armor', slot: 'helmet', def: 4, desc: 'Elmo de ferro simples' },
  // Accessories
  power_ring: { name: 'Anel do Poder', icon: '💍', rarity: 'rare', type: 'accessory', slot: 'ring', atk: 10, mp: 20, desc: 'Amplifica o poder mágico' },
  amulet_shadow: { name: 'Amuleto Sombrio', icon: '📿', rarity: 'epic', type: 'accessory', slot: 'amulet', atk: 15, critChance: 0.10, desc: 'Das trevas vem a força' },
  // Special
  shadow_crystal: { name: 'Cristal Sombrio', icon: '🔮', rarity: 'legendary', type: 'material', desc: 'Material lendário para forja' },
  monster_core: { name: 'Núcleo de Monstro', icon: '💠', rarity: 'uncommon', type: 'material', desc: 'Usado para capturar pets' },
  gold_coin: { name: 'Moeda de Ouro', icon: '🪙', rarity: 'common', type: 'currency', desc: 'Moeda do reino' },
};
