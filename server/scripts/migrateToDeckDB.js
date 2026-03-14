require('dotenv').config();
const mongoose = require('mongoose');

// Copy cards from Card DB to Deck DB, organized by deck_group
async function migrateToDeckDB() {
  try {
    // Connect to source (Card DB)
    const sourceConn = await mongoose.createConnection('mongodb://localhost:27017/Card').asPromise();
    console.log('✅ Connected to Card DB (source)');

    // Connect to destination (Deck DB)
    const destConn = await mongoose.createConnection('mongodb://localhost:27017/Deck').asPromise();
    console.log('✅ Connected to Deck DB (destination)');

    // Get all cards from Card DB
    const sourceCollection = sourceConn.collection('Card');
    const allCards = await sourceCollection.find({}).toArray();
    console.log(`📊 Found ${allCards.length} cards in Card DB`);

    // Group cards by deck_group
    const cardsByDeck = {};
    for (const card of allCards) {
      const deckGroup = card.deck_group || card.faction || 'Neutral';
      // Convert to collection name (remove spaces, special chars)
      const collectionName = deckGroup.replace(/[^a-zA-Z0-9]/g, '');
      
      if (!cardsByDeck[collectionName]) {
        cardsByDeck[collectionName] = [];
      }
      cardsByDeck[collectionName].push(card);
    }

    console.log('\n📦 Deck groups found:');
    for (const [collName, cards] of Object.entries(cardsByDeck)) {
      console.log(`  ${collName}: ${cards.length} cards`);
    }

    // Insert into separate collections
    console.log('\n🚀 Migrating to Deck DB...');
    for (const [collName, cards] of Object.entries(cardsByDeck)) {
      const destCollection = destConn.collection(collName);
      
      // Clear existing
      await destCollection.deleteMany({});
      
      // Insert new
      if (cards.length > 0) {
        await destCollection.insertMany(cards);
        console.log(`  ✅ ${collName}: ${cards.length} cards`);
      }
    }

    console.log('\n🎉 Migration complete!');

    await sourceConn.close();
    await destConn.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrateToDeckDB();
