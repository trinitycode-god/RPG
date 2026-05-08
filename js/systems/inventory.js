// =============================================
// SHADOWREALM ONLINE - INVENTORY SYSTEM
// =============================================

const InventorySystem = {
  MAX_SLOTS: 30,
  items: [], // Array of item objects or null
  equipped: {
    helmet: null,
    weapon: null,
    armor: null,
    boots: null,
    ring: null,
    amulet: null
  },

  init() {
    this.items = new Array(this.MAX_SLOTS).fill(null);
    this.equipped = { helmet: null, weapon: null, armor: null, boots: null, ring: null, amulet: null };
    // Start with some basic items
    this.addItem({ ...ITEMS_DB.hp_potion, id: 'hp_potion', count: 5 });
    this.addItem({ ...ITEMS_DB.mp_potion, id: 'mp_potion', count: 3 });
    this.addItem({ ...ITEMS_DB.iron_sword, id: 'iron_sword', count: 1 });
    this.addItem({ ...ITEMS_DB.leather_armor, id: 'leather_armor', count: 1 });
  },

  // Add item to inventory
  addItem(item) {
    if (!item) return false;
    
    // Stack consumables/currency
    if (item.type === 'consumable' || item.type === 'currency' || item.type === 'material') {
      const existing = this.items.find(i => i && i.id === item.id);
      if (existing) {
        existing.count = (existing.count || 1) + (item.count || 1);
        this.renderInventory();
        return true;
      }
    }
    
    // Find empty slot
    const emptyIdx = this.items.findIndex(i => i === null);
    if (emptyIdx === -1) {
      HUD.addLog('Inventário cheio!', 'system');
      return false;
    }
    
    this.items[emptyIdx] = { ...item, count: item.count || 1 };
    this.renderInventory();
    return true;
  },

  // Remove item by index
  removeItem(index, count = 1) {
    const item = this.items[index];
    if (!item) return null;
    
    if (item.count && item.count > count) {
      item.count -= count;
    } else {
      this.items[index] = null;
    }
    
    this.renderInventory();
    return item;
  },

  // Use item
  useItem(index) {
    const item = this.items[index];
    if (!item) return;
    
    if (item.type === 'consumable') {
      const player = GameState.player;
      if (!player) return;
      
      if (item.effect === 'heal_hp') {
        const healed = Math.min(item.value, player.maxHp - player.hp);
        player.hp = Math.min(player.maxHp, player.hp + item.value);
        HUD.addLog(`+${healed} HP recuperado`, 'heal');
        HUD.updateBars();
        Helpers.showDamageNumber(window.innerWidth / 2, window.innerHeight / 2, '+' + healed, 'heal');
      } else if (item.effect === 'heal_mp') {
        player.mp = Math.min(player.maxMp, player.mp + item.value);
        HUD.addLog(`+${item.value} MP recuperado`, 'heal');
        HUD.updateBars();
      } else if (item.effect === 'heal_both') {
        player.hp = Math.min(player.maxHp, player.hp + item.value);
        player.mp = Math.min(player.maxMp, player.mp + item.value);
        HUD.addLog(`+${item.value} HP e MP recuperados`, 'heal');
        HUD.updateBars();
      }
      
      this.removeItem(index, 1);
    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      this.equipItem(index);
    }
  },

  // Equip item
  equipItem(index) {
    const item = this.items[index];
    if (!item || !item.slot) return;
    
    // Unequip current item in slot
    if (this.equipped[item.slot]) {
      this.addItem(this.equipped[item.slot]);
    }
    
    this.equipped[item.slot] = { ...item };
    this.items[index] = null;
    this.renderInventory();
    this.renderEquipped();
    HUD.addLog(`${item.name} equipado!`, 'system');
    
    // Update player stats
    if (GameState.player) GameState.player.recalcStats();
  },

  // Get total stat bonus from equipment
  getEquipBonus() {
    const bonus = { atk: 0, def: 0, hp: 0, mp: 0, speed: 0, critChance: 0 };
    
    Object.values(this.equipped).forEach(item => {
      if (!item) return;
      if (item.atk) bonus.atk += item.atk;
      if (item.def) bonus.def += item.def;
      if (item.hp) bonus.hp += item.hp;
      if (item.mp) bonus.mp += item.mp;
      if (item.speed) bonus.speed += item.speed;
      if (item.critChance) bonus.critChance += item.critChance;
    });
    
    return bonus;
  },

  // Render inventory UI
  renderInventory() {
    const grid = document.getElementById('inv-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-item';
      const item = this.items[i];
      
      if (item) {
        slot.className += ' ' + item.rarity;
        slot.textContent = item.icon || '?';
        slot.title = item.name;
        
        if (item.count > 1) {
          const count = document.createElement('span');
          count.className = 'inv-count';
          count.textContent = item.count;
          slot.appendChild(count);
        }
        
        slot.addEventListener('click', () => this.useItem(i));
        slot.addEventListener('mouseenter', (e) => this.showTooltip(item, e));
        slot.addEventListener('mouseleave', () => this.hideTooltip());
      }
      
      grid.appendChild(slot);
    }
  },

  // Render equipped slots
  renderEquipped() {
    Object.entries(this.equipped).forEach(([slot, item]) => {
      const el = document.querySelector(`.equip-slot[data-slot="${slot}"]`);
      if (!el) return;
      
      if (item) {
        el.textContent = item.icon || '?';
        el.classList.add('has-item');
        el.title = item.name;
      } else {
        const defaultIcons = {
          helmet: '🪖', weapon: '⚔️', armor: '🛡️', boots: '👢', ring: '💍', amulet: '📿'
        };
        el.textContent = defaultIcons[slot] || '?';
        el.classList.remove('has-item');
      }
    });
  },

  // Show item tooltip
  showTooltip(item, e) {
    let tip = document.getElementById('item-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'item-tooltip';
      tip.className = 'tooltip';
      document.body.appendChild(tip);
    }
    
    const rColor = CONSTANTS.RARITY_COLORS[item.rarity] || '#fff';
    let statsHTML = '';
    if (item.atk) statsHTML += `<div class="tooltip-stat">+${item.atk} ATQ</div>`;
    if (item.def) statsHTML += `<div class="tooltip-stat">+${item.def} DEF</div>`;
    if (item.hp) statsHTML += `<div class="tooltip-stat">+${item.hp} HP</div>`;
    if (item.mp) statsHTML += `<div class="tooltip-stat">+${item.mp} MP</div>`;
    if (item.critChance) statsHTML += `<div class="tooltip-stat">+${Math.round(item.critChance * 100)}% Crítico</div>`;
    
    tip.innerHTML = `
      <div class="tooltip-name" style="color:${rColor}">${item.icon} ${item.name}</div>
      <div class="tooltip-type">${item.rarity.toUpperCase()} ${item.type}</div>
      ${statsHTML}
      <div class="tooltip-desc">${item.desc || ''}</div>
      ${item.type === 'consumable' ? '<div style="color:#aaa;font-size:11px;margin-top:4px">Clique para usar</div>' : ''}
    `;
    
    tip.style.display = 'block';
    tip.style.left = (e.pageX + 12) + 'px';
    tip.style.top = (e.pageY - 20) + 'px';
  },

  hideTooltip() {
    const tip = document.getElementById('item-tooltip');
    if (tip) tip.style.display = 'none';
  },

  // Show character stats in inventory
  renderCharStats() {
    const list = document.getElementById('char-stats-list');
    if (!list || !GameState.player) return;
    
    const p = GameState.player;
    list.innerHTML = `
      <div class="stat-row"><span>HP</span><span>${p.hp}/${p.maxHp}</span></div>
      <div class="stat-row"><span>MP</span><span>${p.mp}/${p.maxMp}</span></div>
      <div class="stat-row"><span>ATQ</span><span>${p.atk}</span></div>
      <div class="stat-row"><span>DEF</span><span>${p.def}</span></div>
      <div class="stat-row"><span>Crítico</span><span>${Math.round(p.critChance * 100)}%</span></div>
      <div class="stat-row"><span>Velocidade</span><span>${Math.round(p.speed)}</span></div>
      <div class="stat-row"><span>Rank</span><span style="color:${CONSTANTS.RANK_COLORS[p.rank]}">${p.rank}</span></div>
      <div class="stat-row"><span>Ouro</span><span style="color:#FFD700">${p.gold || 0}🪙</span></div>
    `;
  }
};
