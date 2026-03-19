const mongoose = require('mongoose');

async function listFactionValues() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Deck');
    console.log('✅ Connected\n');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const deckColls = collections
      .filter(c => !['cards', 'decks', 'metadecks'].includes(c.name))
      .map(c => c.name)
      .sort();
    
    console.log('🔍 Checking faction values per collection:\n');
    
    for (const collName of deckColls) {
      const collection = db.collection(collName);
      const count = await collection.countDocuments();
      
      if (count > 0) {
        const doc = await collection.findOne({});
        let factionValue = null;
        
        if (doc) {
          if (doc.records && Array.isArray(doc.records) && doc.records.length > 0) {
            factionValue = doc.records[0].faction;
          } else {
            factionValue = doc.faction;
          }
        }
        
        console.log(`  ${collName} (${count} docs) → faction: "${factionValue}"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

listFactionValues();
