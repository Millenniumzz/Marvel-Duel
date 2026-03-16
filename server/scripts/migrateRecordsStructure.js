const mongoose = require('mongoose');
require('dotenv').config();

async function migrateRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marvel-duel');
    console.log('✅ Connected to MongoDB\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const cardCollections = collections
      .map(col => col.name)
      .filter(name => !name.startsWith('system.'));
    
    console.log(`📦 Found ${cardCollections.length} collections to migrate\n`);
    
    let totalMigrated = 0;
    
    for (const collectionName of cardCollections) {
      console.log(`\n🔄 Processing collection: ${collectionName}`);
      
      const collection = mongoose.connection.db.collection(collectionName);
      const docs = await collection.find({}).toArray();
      
      console.log(`   Found ${docs.length} documents`);
      
      for (const doc of docs) {
        // Check if this document has flattened structure
        const hasFlattened = Object.keys(doc).some(key => key.startsWith('records.'));
        
        if (!hasFlattened) {
          // Already in correct format or empty
          continue;
        }
        
        console.log(`\n   📝 Migrating document ${doc._id}`);
        
        // Extract all flattened fields
        const flatFields = {};
        Object.keys(doc).forEach(key => {
          if (key.startsWith('records.')) {
            flatFields[key] = doc[key];
          }
        });
        
        console.log(`      Flattened fields:`, Object.keys(flatFields));
        
        // Build proper record object
        const record = {};
        
        // Extract values from flattened structure
        Object.keys(flatFields).forEach(key => {
          // Remove 'records.$.' or 'records.' prefix
          const cleanKey = key.replace(/^records\.\$\./, '').replace(/^records\./, '');
          record[cleanKey] = flatFields[key];
        });
        
        console.log(`      Extracted record keys:`, Object.keys(record));
        
        // Only migrate if we have actual card data
        if (Object.keys(record).length > 1 && (record.display_name || record.card_id)) {
          // Create unset object with explicit field names (no $ operator)
          const unsetFields = {};
          Object.keys(flatFields).forEach(key => {
            // Skip fields with $ operator, just mark as empty string for deletion
            if (!key.includes('$')) {
              unsetFields[key] = '';
            }
          });
          
          // Delete the old document and insert new one with proper structure
          const newDoc = {
            _id: doc._id,
            deck_name: doc.deck_name,
            records: [record]
          };
          
          await collection.deleteOne({ _id: doc._id });
          await collection.insertOne(newDoc);
          
          totalMigrated++;
          console.log(`      ✓ Migrated: ${record.display_name || record.card_id || 'Unknown'}`);
        } else {
          console.log(`      ⚠️  Skipped: insufficient data`);
        }
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Total documents migrated: ${totalMigrated}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

migrateRecords();
