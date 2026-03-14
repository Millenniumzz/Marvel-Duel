require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../src/models/Card');

// Array of cards with their image URLs
// ตัวอย่าง: ใส่ URL รูปจาก Marvel Fandom Wiki
const cardImages = [
  {
    name: 'Groot (Young) - Guardians of the Galaxy',
    image: 'https://static.wikia.nocookie.net/marveldatabase/images/x/xx/Marvel_Duel_Card_0645.jpg'
  },
  {
    name: 'Nebula',
    image: 'https://static.wikia.nocookie.net/marveldatabase/images/a/ab/Marvel_Duel_Card_0646.jpg'
  },
  {
    name: 'Rocket Raccoon',
    image: 'https://static.wikia.nocookie.net/marveldatabase/images/b/bc/Marvel_Duel_Card_0647.jpg'
  },
  // เพิ่มการ์ดอื่น ๆ ที่นี่
  // คัดลอกรูปแบบนี้:
  // {
  //   name: 'Card Name',
  //   image: 'https://static.wikia.nocookie.net/marveldatabase/images/...'
  // },
];

async function bulkUpdateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Card');
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Updating ${cardImages.length} card images...`);

    let updated = 0;
    let notFound = 0;

    for (const cardData of cardImages) {
      const result = await Card.findOneAndUpdate(
        { name: cardData.name },
        { $set: { image: cardData.image } },
        { new: true }
      );

      if (result) {
        updated++;
        console.log(`✅ [${updated}/${cardImages.length}] ${result.name}`);
      } else {
        notFound++;
        console.log(`❌ Not found: ${cardData.name}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Not found: ${notFound}`);
    console.log(`   📝 Total: ${cardImages.length}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

bulkUpdateImages();
