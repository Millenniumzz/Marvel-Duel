require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const DECK_COLLECTIONS = [
  'GuardiansoftheGalaxy', 'Asgard', 'IntergalacticWar', 'StarkIndustries',
  'SpiderVerse', 'Ragnarok', 'MarvelKnights', 'Agents', 'Mystics', 'Eternals',
  'XMen', 'DeadpoolCorps', 'Brotherhood', 'Neutral', 'Special', 'Collaboration'
];

/**
 * Core function to update card images in database
 * @param {Object} imageMapping - { "Card Name": "https://..." }
 * @returns {Object} { updated: number, notFound: string[] }
 */
async function updateCardImages(imageMapping) {
  const db = mongoose.connection.db;
  let totalUpdated = 0;
  const notFoundCards = [];
  const updatedDetails = [];

  for (const collName of DECK_COLLECTIONS) {
    const collection = db.collection(collName);
    const deckDoc = await collection.findOne({});
    
    if (!deckDoc || !deckDoc.records || deckDoc.records.length === 0) continue;

    const records = deckDoc.records;
    let updated = 0;

    // Update matching records
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const baseName = record.base_card_name;
      const displayName = record.display_name;
      
      // Try exact match with base_card_name first, then display_name
      const url = imageMapping[baseName] || imageMapping[displayName];
      
      if (url) {
        records[i].image_url = url;
        updated++;
        updatedDetails.push({ name: baseName || displayName, collection: collName });
      }
    }

    // Save if updated
    if (updated > 0) {
      await collection.updateOne(
        { _id: deckDoc._id },
        { $set: { records: records } }
      );
      totalUpdated += updated;
    }
  }

  // Find cards not in database
  const updatedNames = new Set(updatedDetails.map(d => d.name));
  Object.keys(imageMapping).forEach(cardName => {
    if (!updatedNames.has(cardName)) {
      notFoundCards.push(cardName);
    }
  });

  return { 
    totalUpdated, 
    notFoundCards, 
    updatedDetails 
  };
}

/**
 * Update images from hardcoded mapping in this file
 */
async function updateFromCode() {
  // ✏️ Add card images here
  const IMAGE_MAPPINGS = {
    "Adam Warlock": "https://static.wikia.nocookie.net/marveldatabase/images/9/9d/Marvel_Duel_Card_0013.jpg",
    "Groot (Young)": "https://static.wikia.nocookie.net/marveldatabase/images/f/f5/Marvel_Duel_Card_0345.jpg",
    "Groot (Young) - Guardians of the Galaxy": "https://static.wikia.nocookie.net/marveldatabase/images/8/86/Marvel_Duel_Card_0645.jpg",
    "Nebula": "https://static.wikia.nocookie.net/marveldatabase/images/7/74/Marvel_Duel_Card_0002.jpg",
  };

  console.log(`📝 Processing ${Object.keys(IMAGE_MAPPINGS).length} images...\n`);
  
  const result = await updateCardImages(IMAGE_MAPPINGS);

  // Display results by collection
  const byCollection = {};
  result.updatedDetails.forEach(({ name, collection }) => {
    if (!byCollection[collection]) byCollection[collection] = [];
    byCollection[collection].push(name);
  });

  Object.entries(byCollection).forEach(([coll, cards]) => {
    console.log(`📂 ${coll}`);
    cards.forEach(name => console.log(`   ✅ ${name}`));
    console.log();
  });

  console.log('='.repeat(60));
  console.log(`✨ Complete! Updated: ${result.totalUpdated} cards`);
  if (result.notFoundCards.length > 0) {
    console.log(`⚠️  Not found: ${result.notFoundCards.length} cards`);
    result.notFoundCards.forEach(name => console.log(`   - ${name}`));
  }
  console.log('='.repeat(60));
}

/**
 * Update images from JSON file
 */
async function updateFromJSON(filePath) {
  const fs = require('fs');
  const imageMapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log(`📖 Loaded ${Object.keys(imageMapping).length} images from ${filePath}\n`);
  
  const result = await updateCardImages(imageMapping);
  
  console.log(`✨ Complete! Updated: ${result.totalUpdated} cards`);
  if (result.notFoundCards.length > 0) {
    console.log(`⚠️  Not found: ${result.notFoundCards.join(', ')}`);
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // No args: update from hardcoded IMAGE_MAPPINGS
      await updateFromCode();
    } else if (args[0].endsWith('.json')) {
      // JSON file: update from file
      await updateFromJSON(args[0]);
    } else {
      console.log('Usage:');
      console.log('  node updateImages.js              # Update from hardcoded mappings');
      console.log('  node updateImages.js cards.json   # Update from JSON file');
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Export for use in API routes
module.exports = { updateCardImages };

// Run if executed directly
if (require.main === module) {
  console.log('🚀 Starting image update...\n');
  main();
}
