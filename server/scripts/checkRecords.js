const mongoose = require('mongoose');
require('dotenv').config();

async function checkRecords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marvel-duel');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('GuardiansoftheGalaxy');
    
    // Get ALL documents, not just with records
    const allDocs = await collection.find({}).toArray();
    console.log(`📦 Total documents in collection: ${allDocs.length}\n`);
    
    allDocs.forEach((doc, index) => {
      const recordCount = doc.records ? doc.records.length : 0;
      
      console.log(`\n========== Document ${index + 1} ==========`);
      console.log(`ID: ${doc._id}`);
      console.log(`Has records field: ${!!doc.records}`);
      console.log(`Records is array: ${Array.isArray(doc.records)}`);
      console.log(`Records count: ${recordCount}`);
      console.log(`record_count field: ${doc.record_count || 'N/A'}`);
      console.log(`deck_name: ${doc.deck_name || 'N/A'}`);
      console.log(`Keys:`, Object.keys(doc).slice(0, 10).join(', '));
      
      if (recordCount > 0) {
        console.log(`\nFirst 3 cards:`);
        doc.records.slice(0, 3).forEach((record, i) => {
          const name = record.display_name || record.base_card_name || 'No name';
          const keywords = record.keywords_mechanic || [];
          console.log(`   ${i + 1}. ${name} - Keywords: [${keywords.join(', ') || 'none'}]`);
        });
        
        if (recordCount > 3) {
          console.log(`   ... and ${recordCount - 3} more cards`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n\n👋 Database connection closed');
  }
}

checkRecords();
