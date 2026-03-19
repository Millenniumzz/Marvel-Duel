const mongoose = require('mongoose');
require('dotenv').config();

async function checkFactions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Deck');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const deckColls = collections
      .filter(c => !['cards', 'decks', 'metadecks'].includes(c.name))
      .map(c => c.name);
    
    console.log(`📦 Found ${deckColls.length} deck collections\n`);
    
    const factionSet = new Set();
    
    for (const collName of deckColls) {
      const collection = db.collection(collName);
      const doc = await collection.findOne({});
      
      if (doc) {
        // Check if it's records array structure
        if (doc.records && Array.isArray(doc.records)) {
          doc.records.forEach(card => {
            if (card.faction) factionSet.add(card.faction);
          });
        } else {
          // Flat structure
          if (doc.faction) factionSet.add(doc.faction);
        }
      }
    }
    
    const factions = Array.from(factionSet).sort();
    console.log('🎨 All unique factions found:\n');
    factions.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log(`\n Total: ${factions.length} factions\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkFactions();
