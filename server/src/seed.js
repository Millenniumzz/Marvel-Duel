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

    const metaDecks = [
      {
        name: 'Avengers Aggro',
        description: 'Fast and aggressive Avengers deck. Overwhelm opponents with early pressure.',
        descriptionTh: 'เดคอเวนเจอร์สเชิงรุกสุดเร็ว บุกอย่างหนักตั้งแต่ต้นเกม',
        faction: 'Avengers',
        tier: 'S',
        winRate: 58,
        playstyle: 'Aggro',
        patch: '1.0',
        cards: [
          { card: getCard('Ant-Man')._id, quantity: 3, role: 'Early Game' },
          { card: getCard('Wasp')._id, quantity: 3, role: 'Early Game' },
          { card: getCard('Black Widow')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Hawkeye')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Captain America')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Iron Man')._id, quantity: 2, role: 'Win Condition' },
          { card: getCard('Arc Reactor Overdrive')._id, quantity: 3, role: 'Finisher' },
          { card: getCard('Avengers Assemble')._id, quantity: 1, role: 'Finisher' },
        ],
      },
      {
        name: 'X-Men Control',
        description: 'Control deck using X-Men powerful abilities to dominate the late game.',
        descriptionTh: 'เดคคอนโทรล X-Men ใช้ความสามารถพิเศษเพื่อครองเกมช่วงปลาย',
        faction: 'X-Men',
        tier: 'A',
        winRate: 54,
        playstyle: 'Control',
        patch: '1.0',
        cards: [
          { card: getCard('Cyclops')._id, quantity: 3, role: 'Early Game' },
          { card: getCard('Wolverine')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Storm')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Jean Grey')._id, quantity: 2, role: 'Late Game' },
          { card: getCard('Magneto')._id, quantity: 2, role: 'Win Condition' },
          { card: getCard('Professor X')._id, quantity: 1, role: 'Win Condition' },
          { card: getCard('X-Gene Activation')._id, quantity: 3, role: 'Buff' },
        ],
      },
      {
        name: 'Wakanda Midrange',
        description: 'Balanced midrange deck with strong Wakanda synergies.',
        descriptionTh: 'เดคมิดเรนจ์สมดุล ใช้ซิเนอร์จี Wakanda อย่างเต็มที่',
        faction: 'Wakanda',
        tier: 'A',
        winRate: 52,
        playstyle: 'Midrange',
        patch: '1.0',
        cards: [
          { card: getCard('Okoye')._id, quantity: 3, role: 'Early Game' },
          { card: getCard('Shuri')._id, quantity: 2, role: 'Support' },
          { card: getCard('Black Panther')._id, quantity: 3, role: 'Win Condition' },
          { card: getCard('Nick Fury')._id, quantity: 2, role: 'Support' },
          { card: getCard('Captain Marvel')._id, quantity: 2, role: 'Late Game' },
        ],
      },
      {
        name: 'Guardians Swarm',
        description: 'Swarm the board with Guardians tokens and synergies.',
        descriptionTh: 'ท่วมสนามด้วยโทเค็น Guardians และซิเนอร์จีต่าง ๆ',
        faction: 'Guardians of the Galaxy',
        tier: 'B',
        winRate: 49,
        playstyle: 'Swarm',
        patch: '1.0',
        cards: [
          { card: getCard('Rocket Raccoon')._id, quantity: 3, role: 'Early Game' },
          { card: getCard('Drax')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Gamora')._id, quantity: 2, role: 'Mid Game' },
          { card: getCard('Star-Lord')._id, quantity: 2, role: 'Support' },
          { card: getCard('Groot')._id, quantity: 3, role: 'Win Condition' },
        ],
      },
    ];

    await MetaDeck.insertMany(metaDecks);
    console.log(`✅ Seeded ${metaDecks.length} meta decks`);

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
