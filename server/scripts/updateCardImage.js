require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../src/models/Card');

async function updateCardImage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Card');
    console.log('✅ Connected to MongoDB');

    // Example: Update Groot (Young) image
    const cardName = 'Groot (Young) - Guardians of the Galaxy';
    const imageUrl = 'https://marvel.fandom.com/wiki/Marvel_Duel/Gallery?file=Marvel_Duel_Card_0645.jpg';

    const result = await Card.findOneAndUpdate(
      { name: cardName },
      { $set: { image: imageUrl } },
      { new: true }
    );

    if (result) {
      console.log(`✅ Updated image for: ${result.name}`);
      console.log(`   Image URL: ${result.image}`);
    } else {
      console.log(`❌ Card not found: ${cardName}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateCardImage();
