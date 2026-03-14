require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('./models/Card');
const MetaDeck = require('./models/MetaDeck');

const cards = [
  
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Don't clear existing data - preserve the 543 cards from MongoDB
    console.log('ℹ️  Preserving existing cards in database');

    // Only insert sample cards if they don't exist (check by name)
    let insertedCards = [];
    for (const card of cards) {
      const existing = await Card.findOne({ name: card.name });
      if (!existing) {
        const newCard = await Card.create(card);
        insertedCards.push(newCard);
      }
    }
    
    if (insertedCards.length > 0) {
      console.log(`✅ Added ${insertedCards.length} new sample cards`);
    } else {
      console.log('ℹ️  All sample cards already exist');
      // Get existing cards for meta decks
      insertedCards = await Card.find({ name: { $in: cards.map(c => c.name) } });
    }

    // Create meta decks
    await MetaDeck.deleteMany({});

    const avengersCards = insertedCards.filter((c) => c.faction === 'Avengers');
    const xmenCards = insertedCards.filter((c) => c.faction === 'X-Men');
    const guardianCards = insertedCards.filter((c) => c.faction === 'Guardians of the Galaxy');
    const asgardCards = insertedCards.filter((c) => c.faction === 'Asgard');

    const getCard = (name) => insertedCards.find((c) => c.name === name);

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
