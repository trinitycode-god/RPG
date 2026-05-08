// =============================================
// SHADOWREALM ONLINE - HUD SYSTEM
// =============================================

const HUD = {
  logs: [],
  MAX_LOGS: 6,
  chatMessages: [],
  MAX_CHAT: 20,
  skillCooldowns: {},

  init() {
    this.updateBars();
    this.renderSkillBar();
    this.renderPortrait();
    this.bindKeys();
    
    // Skill slot click events
    ['q', 'w', 'e', 'r', 'f'].forEach(key => {
      const slot = document.getElementById('skill-' + key);
      if (slot) slot.addEventListener('click', () => this.triggerSkill(key.toUpperCase()));
    });
    
    // Inventory toggle
    document.getElementById('inv-btn').addEventListener('click', () => this.toggleInventory());
    document.getElementById('close-inv').addEventListener('click', () => this.toggleInventory(false));
    document.getElementById('close-skills').addEventListener('click', () => this.toggleSkillTree(false));
    document.getElementById('mount-btn').addEventListener('click', () => this.toggleMount());
    
    // Chat input
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const msg = chatInput.value.trim();
        if (msg) {
          this.addChat(GameState.playerName || 'Herói', msg);
          chatInput.value = '';
        }
        chatInput.blur();
      }
    });

    // Add welcome messages
    setTimeout(() => {
      this.addChat('Sistema', 'Bem-vindo ao ShadowRealm Online!');
      this.addChat('Sistema', 'Use WASD ou setas para mover. Q,W,E,R,F para skills!');
    }, 1000);
  },

  bindKeys() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      
      switch (e.key.toUpperCase()) {
        case 'Q': this.triggerSkill('Q'); break;
        case 'W': if (!['W','S','A','D'].includes(e.key.toUpperCase()) || e.shiftKey) this.triggerSkill('W'); break;
        case 'E': this.triggerSkill('E'); break;
        case 'R': this.triggerSkill('R'); break;
        case 'F': this.triggerSkill('F'); break;
        case 'I': this.toggleInventory(); break;
        case 'K': this.toggleSkillTree(); break;
        case 'M': this.toggleMount(); break;
        case 'ENTER': document.getElementById('chat-input').focus(); break;
      }
    });
  },

  triggerSkill(key) {
    if (!GameState.player) return;
    const keyLower = key.toLowerCase();
    const cd = this.skillCooldowns[key];
    if (cd && cd > Date.now()) return; // On cooldown
    
    const classType = GameState.playerClass;
    const skillDef = SkillsSystem.definitions[classType]?.[keyLower];
    if (!skillDef) return;
    
    // Check MP
    if (GameState.player.mp < skillDef.mp) {
      this.addLog('Mana insuficiente!', 'system');
      return;
    }
    
    // Use MP
    GameState.player.mp -= skillDef.mp;
    this.updateBars();
    
    // Set cooldown
    this.skillCooldowns[key] = Date.now() + skillDef.cd;
    this.startCooldownDisplay(key, skillDef.cd);
    
    // Trigger skill in game scene
    if (GameState.scene) {
      GameState.scene.useSkill(keyLower, skillDef);
    }
  },

  startCooldownDisplay(key, duration) {
    const slot = document.getElementById('skill-' + key.toLowerCase());
    const cdEl = document.getElementById('skill-cd-' + key.toLowerCase());
    if (!slot || !cdEl) return;
    
    slot.classList.add('on-cooldown');
    const start = Date.now();
    
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = duration - elapsed;
      
      if (remaining <= 0) {
        slot.classList.remove('on-cooldown');
        cdEl.textContent = '';
        return;
      }
      
      cdEl.textContent = (remaining / 1000).toFixed(1);
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  },

  updateBars() {
    if (!GameState.player) return;
    const p = GameState.player;
    
    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    const mpPct = Math.max(0, (p.mp / p.maxMp) * 100);
    const expPct = Math.max(0, (p.exp / p.expNeeded) * 100);
    
    const hpFill = document.getElementById('hp-fill');
    const mpFill = document.getElementById('mp-fill');
    const expFill = document.getElementById('exp-fill');
    
    if (hpFill) hpFill.style.width = hpPct + '%';
    if (mpFill) mpFill.style.width = mpPct + '%';
    if (expFill) expFill.style.width = expPct + '%';
    
    const hpText = document.getElementById('hp-text');
    const mpText = document.getElementById('mp-text');
    const expText = document.getElementById('exp-text');
    
    if (hpText) hpText.textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
    if (mpText) mpText.textContent = `${Math.ceil(p.mp)}/${p.maxMp}`;
    if (expText) expText.textContent = `${p.exp}/${p.expNeeded}`;
    
    const levelBadge = document.getElementById('level-badge');
    if (levelBadge) levelBadge.textContent = p.level;
    
    const rankText = document.getElementById('rank-text');
    if (rankText) {
      rankText.textContent = 'Rank ' + p.rank;
      rankText.style.color = CONSTANTS.RANK_COLORS[p.rank] || '#fff';
    }
    
    const rankAura = document.getElementById('rank-aura');
    if (rankAura) rankAura.style.background = CONSTANTS.RANK_COLORS[p.rank] || '#fff';
  },

  renderSkillBar() {
    if (!GameState.playerClass) return;
    const classType = GameState.playerClass;
    const skills = SkillsSystem.definitions[classType];
    if (!skills) return;
    
    ['q', 'w', 'e', 'r', 'f'].forEach(key => {
      const skill = skills[key];
      if (!skill) return;
      const icon = document.getElementById('skill-icon-' + key);
      if (icon) icon.textContent = skill.icon;
    });
  },

  renderPortrait() {
    const canvas = document.getElementById('portrait-canvas');
    if (!canvas || !GameState.playerClass) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 50, 50);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 50, 50);
    Helpers.drawCharacter(ctx, 25, 38, GameState.playerClass, 0.8);
  },

  addLog(message, type = '') {
    const log = document.getElementById('log-messages');
    if (!log) return;
    
    const p = document.createElement('p');
    p.textContent = message;
    p.className = type;
    log.insertBefore(p, log.firstChild);
    
    this.logs.push(p);
    if (this.logs.length > this.MAX_LOGS) {
      const old = this.logs.shift();
      if (old.parentNode) old.parentNode.removeChild(old);
    }
  },

  addChat(sender, message) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;
    
    const p = document.createElement('p');
    p.innerHTML = `<span class="name">${sender}:</span> ${message}`;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
    
    this.chatMessages.push(p);
    if (this.chatMessages.length > this.MAX_CHAT) {
      const old = this.chatMessages.shift();
      if (old.parentNode) old.parentNode.removeChild(old);
    }
  },

  updateZone(zoneName) {
    const zoneText = document.getElementById('zone-text');
    if (zoneText) zoneText.textContent = zoneName;
  },

  updatePet(pet) {
    const canvas = document.getElementById('pet-canvas');
    const nameEl = document.getElementById('pet-name');
    const hpFill = document.getElementById('pet-hp-fill');
    
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 40, 40);
    
    if (pet) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, 40, 40);
      Helpers.drawPet(ctx, 20, 20, pet.type, 1);
      if (nameEl) nameEl.textContent = pet.name;
      if (hpFill) hpFill.style.width = Math.max(0, (pet.hp / pet.maxHp) * 100) + '%';
    } else {
      if (nameEl) nameEl.textContent = 'Sem pet';
      if (hpFill) hpFill.style.width = '0%';
    }
  },

  toggleInventory(forceState) {
    const overlay = document.getElementById('inventory-overlay');
    if (!overlay) return;
    
    if (forceState === false || !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    } else {
      overlay.classList.remove('hidden');
      InventorySystem.renderInventory();
      InventorySystem.renderEquipped();
      InventorySystem.renderCharStats();
    }
  },

  toggleSkillTree(forceState) {
    const overlay = document.getElementById('skilltree-overlay');
    if (!overlay) return;
    
    if (forceState === false || !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    } else {
      overlay.classList.remove('hidden');
      this.renderSkillTree();
    }
  },

  renderSkillTree() {
    const content = document.getElementById('skill-tree-content');
    if (!content || !GameState.playerClass) return;
    
    const tree = SkillsSystem.trees[GameState.playerClass] || [];
    const skillPoints = document.getElementById('skill-points');
    if (skillPoints) skillPoints.textContent = GameState.skillPoints || 0;
    
    content.innerHTML = '';
    const col = document.createElement('div');
    col.className = 'skill-tree-column';
    col.innerHTML = `<h4>HABILIDADES PASSIVAS — ${GameState.playerClass.toUpperCase()}</h4>`;
    
    tree.forEach(skill => {
      const playerSkill = SkillsSystem.playerSkills[skill.id] || { rank: 0, maxRank: skill.maxRank };
      const node = document.createElement('div');
      node.className = 'skill-node' + (playerSkill.rank > 0 ? ' unlocked' : '') + (playerSkill.rank >= skill.maxRank ? ' maxed' : '');
      
      node.innerHTML = `
        <div class="skill-node-icon">⬆</div>
        <div class="skill-node-info">
          <div class="skill-node-name">${skill.name}</div>
          <div class="skill-node-desc">${skill.desc}</div>
          <div class="skill-node-rank">Rank: ${playerSkill.rank}/${skill.maxRank} | Custo: ${skill.cost} pts</div>
        </div>
      `;
      
      node.addEventListener('click', () => {
        if (SkillsSystem.unlockSkill(skill.id, GameState.playerClass)) {
          Notifications.show('Habilidade melhorada: ' + skill.name, 'item');
          this.renderSkillTree();
          if (GameState.player) GameState.player.recalcStats();
        } else {
          if ((GameState.skillPoints || 0) < skill.cost) {
            Notifications.show('Pontos insuficientes!', '');
          } else {
            Notifications.show('Rank máximo atingido!', '');
          }
        }
      });
      
      col.appendChild(node);
    });
    
    content.appendChild(col);
    
    // Active skills column
    const col2 = document.createElement('div');
    col2.className = 'skill-tree-column';
    col2.innerHTML = `<h4>HABILIDADES ATIVAS</h4>`;
    
    const activeSkills = SkillsSystem.definitions[GameState.playerClass] || {};
    Object.entries(activeSkills).forEach(([key, skill]) => {
      const node = document.createElement('div');
      node.className = 'skill-node unlocked';
      node.innerHTML = `
        <div class="skill-node-icon">${skill.icon}</div>
        <div class="skill-node-info">
          <div class="skill-node-name">[${key.toUpperCase()}] ${skill.name}</div>
          <div class="skill-node-desc">${skill.desc}</div>
          <div class="skill-node-rank">MP: ${skill.mp} | CD: ${(skill.cd / 1000).toFixed(1)}s</div>
        </div>
      `;
      col2.appendChild(node);
    });
    
    content.appendChild(col2);
  },

  toggleMount() {
    if (!GameState.player) return;
    
    if (GameState.player.mounted) {
      GameState.player.mounted = false;
      GameState.player.speed = GameState.player.baseSpeed;
      this.addLog('Desmontou.', 'system');
      Notifications.show('Desmontou!', '');
    } else {
      // Check if player has a mount
      const mount = GameState.currentMount;
      if (mount) {
        GameState.player.mounted = true;
        const mountData = CONSTANTS.MOUNT_TYPES[mount];
        GameState.player.speed = GameState.player.baseSpeed * (mountData?.speedBonus || 1.5);
        this.addLog('Montou em ' + (mountData?.name || 'Montaria') + '!', 'system');
        Notifications.show('Montou em ' + (mountData?.name || 'Montaria') + '! ' + (mountData?.icon || ''), '');
      } else {
        // Give first mount
        GameState.currentMount = 'horse';
        this.addLog('Você ganhou um Cavalo!', 'loot');
        Notifications.show('🐎 Cavalo obtido!', 'item');
      }
    }
    
    const mountBtn = document.getElementById('mount-btn');
    if (mountBtn) {
      const mount = GameState.currentMount;
      const mountData = CONSTANTS.MOUNT_TYPES[mount];
      mountBtn.textContent = mountData?.icon || '🐺';
    }
  }
};
