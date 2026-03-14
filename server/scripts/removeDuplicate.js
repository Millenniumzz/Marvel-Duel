require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../src/models/Card');

async function removeDuplicate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Card');
    
    const cardName = 'Groot (Young) - Guardians of the Galaxy';
    const duplicates = await Card.find({ name: cardName });
    
    console.log(`Found ${duplicates.length} cards with name: "${cardName}"`);
    
    if (duplicates.length > 1) {
      // Keep the first one, delete the rest
      const toDelete = duplicates.slice(1);
      console.log('Deleting duplicate IDs:', toDelete.map(d => d._id.toString()));
      
      for (const dup of toDelete) {
        await Card.deleteOne({ _id: dup._id });
      }
      
      console.log(`✅ Deleted ${toDelete.length} duplicate(s)`);
    } else {
      console.log('ℹ️  No duplicates found');
    }
    
    const total = await Card.countDocuments();
    console.log(`📊 Total cards now: ${total}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

removeDuplicate();
