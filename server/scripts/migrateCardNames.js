require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Card');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('Card');

    // Find all cards that have card_name but no name field
    const cardsToMigrate = await collection.find({ 
      card_name: { $exists: true },
      name: { $exists: false }
    }).toArray();

    console.log(`📊 Found ${cardsToMigrate.length} cards to migrate`);

    let updated = 0;
    for (const card of cardsToMigrate) {
      await collection.updateOne(
        { _id: card._id },
        { 
          $set: { 
            name: card.card_name,
            // Set defaults for required fields if missing
            faction: card.deck_group || 'Neutral',
            cost: card.cost || 0,
            type: 'Character',
            power: 0,
            health: 0,
            rarity: 'Common',
            description: card.ability_text || ''
          }
        }
      );
      updated++;
      if (updated % 50 === 0) {
        console.log(`  Updated ${updated}/${cardsToMigrate.length}...`);
      }
    }

    console.log(`✅ Migration complete! Updated ${updated} cards`);
    
    // Verify
    const totalCards = await collection.countDocuments();
    const cardsWithName = await collection.countDocuments({ name: { $exists: true } });
    console.log(`📊 Total cards: ${totalCards}`);
    console.log(`📊 Cards with 'name' field: ${cardsWithName}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrate();
