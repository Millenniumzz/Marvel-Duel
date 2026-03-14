const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Deck')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('guardiansofthegalaxies');
    
    const docs = await collection.find({}).toArray();
    
    console.log(`Found ${docs.length} documents`);
    
    // Find all characters with Groot in name
    const allGroots = [];
    
    docs.forEach(doc => {
      if (doc.records && Array.isArray(doc.records)) {
        doc.records.forEach(record => {
          if (record.name && /groot/i.test(record.name)) {
            allGroots.push(record);
          }
        });
      }
    });
    
    console.log(`\nFound ${allGroots.length} Groot characters:\n`);
    
    allGroots.forEach((groot, index) => {
      console.log(`\n======= GROOT #${index + 1} =======`);
      console.log('Name:', groot.name);
      console.log('Name (TH):', groot.name_th || 'N/A');
      
      console.log('\n--- ABILITY ---');
      console.log(groot.ability || groot.ability_text || 'NO ABILITY');
      
      console.log('\n--- SUB SKILL 1 ---');
      console.log(groot.sub_skill_1 || 'NO SUB SKILL 1');
      
      console.log('\n--- SUB SKILL 2 ---');
      console.log(groot.sub_skill_2 || 'NO SUB SKILL 2');
      
      console.log('\n--- UNITY EFFECT ---');
      console.log(groot.unity_effect || groot.unity_text || 'NO UNITY');
      
      console.log('\n--- HAS UNITY ---');
      console.log(groot.has_unity);
      
      console.log('\n--- DESCRIPTION ---');
      console.log(groot.description || groot.flavor_text || 'NO DESCRIPTION');
      console.log('\n' + '='.repeat(50));
    });
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
