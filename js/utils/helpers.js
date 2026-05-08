// =============================================
// SHADOWREALM ONLINE - HELPERS
// =============================================

const Helpers = {
  // Random int between min and max (inclusive)
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  
  // Random float
  randFloat(min, max) { return Math.random() * (max - min) + min; },
  
  // Random element from array
  randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  
  // Chance check (0.0 to 1.0)
  chance(prob) { return Math.random() < prob; },
  
  // Distance between two points
  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },
  
  // Clamp value between min and max
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  
  // Lerp
  lerp(a, b, t) { return a + (b - a) * t; },
  
  // Format number with K/M suffixes
  formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  },
  
  // Get EXP required for level
  expForLevel(level) {
    return Math.floor(CONSTANTS.EXP_PER_LEVEL_BASE * Math.pow(CONSTANTS.EXP_SCALE, level - 1));
  },
  
  // Get rank from level
  getRank(level) {
    for (let i = CONSTANTS.RANK_LEVELS.length - 1; i >= 0; i--) {
      if (level >= CONSTANTS.RANK_LEVELS[i]) {
        return CONSTANTS.RANKS[i];
      }
    }
    return 'E';
  },
  
  // Roll item rarity
  rollRarity() {
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < CONSTANTS.RARITIES.length; i++) {
      cumulative += CONSTANTS.RARITY_CHANCE[i];
      if (roll < cumulative) return CONSTANTS.RARITIES[i];
    }
    return 'common';
  },
  
  // Generate random loot
  generateLoot(enemyType) {
    const loots = [];
    const enemy = CONSTANTS.ENEMY_TYPES[enemyType];
    if (!enemy) return loots;
    
    // Gold always drops
    const goldAmt = Helpers.randInt(enemy.gold, enemy.gold * 2);
    loots.push({ ...ITEMS_DB.gold_coin, count: goldAmt });
    
    // Item drops based on chance
    if (Helpers.chance(enemy.dropChance)) {
      const rarity = Helpers.rollRarity();
      const possibleItems = Object.entries(ITEMS_DB)
        .filter(([k, v]) => v.rarity === rarity && v.type !== 'currency')
        .map(([k]) => k);
      if (possibleItems.length > 0) {
        const itemKey = Helpers.randFrom(possibleItems);
        loots.push({ ...ITEMS_DB[itemKey], id: itemKey, count: 1 });
      }
    }
    
    // Chance to drop monster core (for pet capture)
    if (Helpers.chance(0.1)) {
      loots.push({ ...ITEMS_DB.monster_core, id: 'monster_core', count: 1 });
    }
    
    return loots;
  },
  
  // Draw pixel art character on canvas
  drawCharacter(ctx, x, y, classType, scale = 1, color = null) {
    const colors = {
      warrior: { body: '#4466AA', hair: '#883300', skin: '#FFCC99', armor: '#778899' },
      mage: { body: '#8844CC', hair: '#AAAAFF', skin: '#FFCC99', armor: '#553388' },
      archer: { body: '#446644', hair: '#AA6622', skin: '#FFCC99', armor: '#335533' },
      shadow: { body: '#111122', hair: '#330033', skin: '#CCAAAA', armor: '#222233' }
    };
    const c = color || colors[classType] || colors.warrior;
    const s = scale;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.ellipse(0, 14 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Legs
    ctx.fillStyle = c.armor;
    ctx.fillRect(-6 * s, 8 * s, 5 * s, 8 * s);
    ctx.fillRect(1 * s, 8 * s, 5 * s, 8 * s);
    
    // Boots
    ctx.fillStyle = '#332211';
    ctx.fillRect(-7 * s, 14 * s, 6 * s, 3 * s);
    ctx.fillRect(1 * s, 14 * s, 6 * s, 3 * s);
    
    // Body
    ctx.fillStyle = c.body;
    ctx.fillRect(-7 * s, -2 * s, 14 * s, 12 * s);
    
    // Armor detail
    ctx.fillStyle = c.armor;
    ctx.fillRect(-6 * s, -1 * s, 12 * s, 10 * s);
    
    // Arms
    ctx.fillStyle = c.skin;
    ctx.fillRect(-10 * s, -1 * s, 4 * s, 9 * s);
    ctx.fillRect(6 * s, -1 * s, 4 * s, 9 * s);
    
    // Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(-6 * s, -12 * s, 12 * s, 12 * s);
    
    // Hair
    ctx.fillStyle = c.hair;
    ctx.fillRect(-7 * s, -14 * s, 14 * s, 5 * s);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-3 * s, -9 * s, 2 * s, 2 * s);
    ctx.fillRect(1 * s, -9 * s, 2 * s, 2 * s);
    
    // Weapon based on class
    if (classType === 'warrior') {
      ctx.fillStyle = '#AAAACC';
      ctx.fillRect(7 * s, -8 * s, 3 * s, 18 * s);
      ctx.fillStyle = '#CCCCDD';
      ctx.fillRect(5 * s, -5 * s, 7 * s, 2 * s);
    } else if (classType === 'mage') {
      ctx.fillStyle = '#6622AA';
      ctx.fillRect(8 * s, -14 * s, 3 * s, 20 * s);
      ctx.fillStyle = '#AA44FF';
      ctx.fillRect(6 * s, -16 * s, 7 * s, 5 * s);
      ctx.fillStyle = '#AAFFFF';
      ctx.fillRect(8 * s, -18 * s, 3 * s, 3 * s);
    } else if (classType === 'archer') {
      ctx.strokeStyle = '#882200';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(10 * s, -5 * s, 10 * s, -0.8, 0.8);
      ctx.stroke();
    } else if (classType === 'shadow') {
      ctx.fillStyle = '#330033';
      ctx.fillRect(7 * s, -10 * s, 2 * s, 18 * s);
      ctx.fillStyle = '#8800AA';
      ctx.fillRect(5 * s, -12 * s, 6 * s, 3 * s);
    }
    
    ctx.restore();
  },
  
  // Draw pet on canvas
  drawPet(ctx, x, y, petType, scale = 1) {
    const icons = { spirit_wolf: '🐺', fire_fox: '🦊', shadow_panther: '🐆', storm_eagle: '🦅', dark_dragon: '🐉' };
    ctx.save();
    ctx.translate(x, y);
    ctx.font = `${24 * scale}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[petType] || '🐾', 0, 0);
    ctx.restore();
  },
  
  // Show damage number on screen
  showDamageNumber(x, y, amount, type = 'normal') {
    const container = document.getElementById('game-screen');
    if (!container) return;
    
    const el = document.createElement('div');
    el.className = 'dmg-number';
    el.textContent = type === 'miss' ? 'FALHOU' : (type === 'crit' ? '⚡' + amount : amount);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = type === 'crit' ? '#FFD700' : type === 'miss' ? '#888' : type === 'heal' ? '#44FF88' : '#FF4422';
    el.style.fontSize = type === 'crit' ? '20px' : '16px';
    el.style.textShadow = '2px 2px 4px #000';
    container.appendChild(el);
    
    setTimeout(() => el.remove(), 1200);
  }
};
