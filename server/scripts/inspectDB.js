const mongoose = require('mongoose');
require('dotenv').config();

async function inspectDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marvel-duel');
    console.log('✅ Connected to MongoDB\n');
    
    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📦 Found ${collections.length} collections:\n`);
    
    // Check each collection for card counts
    for (const col of collections) {
      const collName = col.name;
      const collection = db.collection(collName);
      
      const totalDocs = await collection.countDocuments();
      const docsWithRecords = await collection.countDocuments({ 
        records: { $exists: true, $ne: [] } 
      });
      
      console.log(`   ${collName}:`);
      console.log(`      Total documents: ${totalDocs}`);
      console.log(`      Documents with records: ${docsWithRecords}`);
      
      // Show sample document if exists
      if (docsWithRecords > 0) {
        const sample = await collection.findOne({ records: { $exists: true, $ne: [] } });
        if (sample && sample.records && sample.records.length > 0) {
          const firstRecord = sample.records[0];
          console.log(`      Sample card: ${firstRecord.display_name || firstRecord.name || 'No name'}`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

inspectDatabase();
