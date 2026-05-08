# ⚔️ ShadowRealm Online - MMORPG

Um MMORPG 2D jogável diretamente no navegador, inspirado em Tibia, MU Online, Solo Leveling e Naruto.

![ShadowRealm Online](https://img.shields.io/badge/Status-Jogável-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Phaser](https://img.shields.io/badge/Phaser-3.60-orange)

---

## 🎮 Como Jogar

Abra `index.html` no navegador (ou acesse via GitHub Pages).

### Controles

| Tecla | Ação |
|-------|------|
| `WASD` / `Setas` | Mover personagem |
| `Q` | Habilidade 1 (ataque básico especial) |
| `W` | Habilidade 2 |
| `E` | Habilidade 3 (dash/teleport) |
| `R` | Habilidade Ultimate |
| `F` | Interagir com NPC (quando próximo) |
| `G` | Entrar na Dungeon (quando próximo da entrada) |
| `I` | Abrir/fechar Inventário |
| `K` | Abrir Árvore de Habilidades |
| `M` | Montar/desmontar |
| `ESC` | Sair da Dungeon |
| `Enter` | Abrir chat |

### Sistema de Classes

| Classe | Descrição | Skills |
|--------|-----------|--------|
| ⚔️ **Guerreiro** | Alto HP e defesa, mestre corpo a corpo | Golpe Poderoso, Grito de Guerra, Investida, Fúria |
| 🔮 **Mago** | Dano mágico devastador | Bola de Fogo (Katon!), Raio Arcano, Teletransporte, Meteoro |
| 🏹 **Arqueiro** | Velocidade e precisão à distância | Flecha Tripla, Flecha de Gelo, Salto Ninja, Chuva de Flechas |
| 🌑 **Assassino** | Sombras e poderes Solo Leveling | Extração Sombria, Clones (Kage Bunshin!), Passo das Sombras, Exército das Sombras |

### Sistema de Rank (Solo Leveling)

Evolua de **Rank E** até **Rank MONARCH** conforme ganha níveis:
- E → D (Nível 10)
- D → C (Nível 20)  
- C → B (Nível 35)
- B → A (Nível 50)
- A → S (Nível 70)
- S → SS (Nível 90)
- SS → SSS (Nível 110)
- SSS → MONARCH (Nível 130)

### Sistema de Pets

1. Colete **Núcleo de Monstro** (drop de inimigos, ~10% de chance)
2. Derrote inimigos e os capture usando o núcleo
3. Use `F` (skill de pet) para invocar/dispensar seu pet
4. Pets seguem o jogador e atacam inimigos automaticamente
5. Pets ganham EXP e evoluem!

**Pets disponíveis:**
- 🐺 Lobo Espiritual (Incomum)
- 🦊 Raposa de Fogo (Raro)
- 🐆 Pantera Sombria (Épico) — dropa do Cavaleiro Sombrio
- 🦅 Águia da Tempestade (Raro)
- 🐉 Dragão Sombrio (Lendário) — dropa do Boss Dragão

### Montarias

Pressione `M` para receber e usar sua primeira montaria.
Montarias aumentam velocidade de movimento significativamente.

### Dungeon

1. Vá até a **Floresta Sombria** (siga a estrada ao sul)
2. Encontre a **Entrada da Dungeon** (mapa sul-esquerdo, ~tile 12,45)
3. Pressione `G` ao se aproximar para entrar
4. Enfrente ondas de inimigos cada vez mais fortes
5. Na onda 4: **Boss Dragão das Sombras** aparece!
6. Pressione `ESC` para sair a qualquer momento

### Inventário & Equipamentos

- `I` para abrir o inventário
- Clique em itens consumíveis para usá-los
- Clique em equipamentos para equipá-los automaticamente
- Raridades: Comum → Incomum → Raro → Épico → **Lendário**

---

## 🚀 Deploy no GitHub Pages

### Método 1: GitHub Desktop
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Vá em **Settings → Pages**
4. Source: **Deploy from a branch → main → / (root)**
5. Aguarde e acesse `https://SEU_USUARIO.github.io/REPO_NAME/`

### Método 2: Git CLI
```bash
git init
git add .
git commit -m "feat: ShadowRealm Online MMORPG v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/shadowrealm-online.git
git push -u origin main
```
Depois ative GitHub Pages nas configurações do repositório.

### Deploy no Vercel
```bash
npm install -g vercel
vercel --prod
```
Ou conecte o repositório GitHub na interface do Vercel.

---

## 📁 Estrutura do Projeto

```
shadowrealm-online/
├── index.html              # Ponto de entrada
├── css/
│   └── style.css           # Estilos completos
├── js/
│   ├── main.js             # Controlador principal + UI
│   ├── utils/
│   │   ├── constants.js    # Constantes do jogo
│   │   └── helpers.js      # Funções utilitárias
│   ├── systems/
│   │   ├── combat.js       # Sistema de combate
│   │   ├── inventory.js    # Sistema de inventário
│   │   ├── skills.js       # Sistema de habilidades
│   │   ├── loot.js         # Sistema de loot
│   │   └── particles.js    # Partículas decorativas
│   ├── entities/
│   │   ├── player.js       # Entidade jogador
│   │   ├── enemy.js        # Entidade inimigo
│   │   ├── pet.js          # Entidade pet + PetSystem
│   │   └── npc.js          # Entidade NPC
│   ├── ui/
│   │   ├── hud.js          # HUD (HP/MP/EXP/Skills)
│   │   ├── minimap.js      # Minimapa
│   │   └── notifications.js # Sistema de notificações
│   └── scenes/
│       ├── BootScene.js    # Carregamento de assets
│       ├── GameScene.js    # Mundo principal
│       └── DungeonScene.js # Dungeon
└── README.md
```

---

## 🛠️ Tecnologias Utilizadas

- **Phaser 3.60** — Motor de jogo (via CDN, gratuito)
- **HTML5 Canvas** — Renderização de sprites gerados proceduralmente
- **CSS3** — Interface estilo MMORPG com efeitos
- **JavaScript ES6+** — Lógica do jogo
- **Google Fonts** — Cinzel e Rajdhani (gratuitas)

**100% gratuito. Zero dependências pagas. Zero backend necessário.**

---

## 🔮 Roadmap (Expansão Futura)

- [ ] Multiplayer real com Socket.io + Node.js
- [ ] Sistema de guildas
- [ ] PvP na Arena com ranking
- [ ] Mais dungeons e bosses
- [ ] Sistema de crafting
- [ ] Masmorras procedurais
- [ ] Missões com recompensas
- [ ] Sistema de mapa dinâmico
- [ ] Sons e música
- [ ] Assets pixel art profissionais
- [ ] Banco de dados de personagens (Supabase/Firebase)

---

## 📜 Licença

MIT License — use, modifique e distribua livremente.

---

*ShadowRealm Online — Forjado nas sombras, jogado com honra.* ⚔️
