// Loot system is integrated into helpers.js and game scenes
// This file provides the LootSystem namespace for future expansion

const LootSystem = {
  // Drop table modifiers by zone
  zoneDropBonus: {
    town: 0.5,
    forest: 1.0,
    dungeon: 2.0,
    arena: 1.5
  },

  // Get modified loot based on zone
  getLoot(enemyType, zone) {
    const base = Helpers.generateLoot(enemyType);
    const bonus = this.zoneDropBonus[zone] || 1.0;

    // In dungeon, extra chance for rare items
    if (zone === 'dungeon' && Helpers.chance(0.2)) {
      const rareItems = ['shadow_blade', 'shadow_cloak', 'power_ring', 'amulet_shadow'];
      const itemKey = Helpers.randFrom(rareItems);
      if (ITEMS_DB[itemKey]) {
        base.push({ ...ITEMS_DB[itemKey], id: itemKey, count: 1 });
      }
    }

    return base;
  }
};
