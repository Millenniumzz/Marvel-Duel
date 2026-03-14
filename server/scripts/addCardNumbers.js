/**
 * Add card_number field to all cards in the database
 * Extracts card numbers from existing image URLs or image_file fields
 */

const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Extract card number from image URL
 * @param {string} url - Image URL containing card number
 * @returns {string|null} - Card number like "0645" or null if not found
 */
function extractCardNumber(url) {
  if (!url) return null;
  
  // Match pattern: Marvel_Duel_Card_XXXX
  const match = url.match(/Marvel_Duel_Card_(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Add card numbers to all collections
 */
async function addCardNumbersToDatabase() {
  try {
    console.log('🚀 Starting card number addition...\n');
    
    // Connect to MongoDB
    console.log('💾 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Deck');
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const allCollections = await db.listCollections().toArray();
    const collectionNames = allCollections.map(c => c.name);
    
    // Filter to only card collections (skip system collections)
    const cardCollections = collectionNames.filter(name => 
      !['cards', 'decks', 'metadecks'].includes(name)
    );
    
    console.log(`📦 Found ${cardCollections.length} card collections to process\n`);
    
    let totalUpdated = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;
    
    // Process each collection
    for (const collectionName of cardCollections) {
      console.log(`📂 Processing collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      const deckDoc = await collection.findOne();
      
      if (!deckDoc || !deckDoc.records || deckDoc.records.length === 0) {
        console.log(`   ⚠️  No records found, skipping...\n`);
        continue;
      }
      
      let updatedInCollection = 0;
      let skippedInCollection = 0;
      
      // Update each record
      for (let i = 0; i < deckDoc.records.length; i++) {
        const record = deckDoc.records[i];
        totalProcessed++;
        
        // Check if card_number already exists
        if (record.card_number) {
          skippedInCollection++;
          totalSkipped++;
          continue;
        }
        
        // Try to extract from image_url or image_file
        const imageUrl = record.image_url || record.image_file;
        const cardNumber = extractCardNumber(imageUrl);
        
        if (cardNumber) {
          // Add card_number field
          deckDoc.records[i].card_number = cardNumber;
          updatedInCollection++;
          totalUpdated++;
        } else {
          skippedInCollection++;
          totalSkipped++;
        }
      }
      
      // Save updated document
      if (updatedInCollection > 0) {
        await collection.updateOne(
          { _id: deckDoc._id },
          { $set: { records: deckDoc.records } }
        );
        console.log(`   ✅ Updated ${updatedInCollection} records (${skippedInCollection} skipped)`);
      } else {
        console.log(`   ⚠️  No updates needed (${skippedInCollection} already have card_number)`);
      }
      
      console.log('');
    }
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Card number addition complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   Total records processed: ${totalProcessed}`);
    console.log(`   Updated with card_number: ${totalUpdated}`);
    console.log(`   Skipped (already have or no URL): ${totalSkipped}`);
    console.log('═══════════════════════════════════════\n');
    
    await mongoose.disconnect();
    console.log('🎉 Done!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addCardNumbersToDatabase();
}

module.exports = { addCardNumbersToDatabase, extractCardNumber };
