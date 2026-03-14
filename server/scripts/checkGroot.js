const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Deck')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('guardiansofthegalaxies');
    
    const doc = await collection.findOne({ 'records.name': /Groot/i });
    
    if (doc && doc.records) {
      const groot = doc.records.find(r => /Groot/i.test(r.name));
      
      if (groot) {
        console.log('\n=== GROOT CHARACTER DATA ===\n');
        console.log('Name:', groot.name);
        console.log('Name (TH):', groot.name_th || 'N/A');
        
        console.log('\n--- ABILITY ---');
        console.log(groot.ability || groot.ability_text || 'NO ABILITY FOUND');
        
        console.log('\n--- SUB SKILL 1 ---');
        console.log(groot.sub_skill_1 || 'NO SUB SKILL 1 FOUND');
        
        console.log('\n--- SUB SKILL 2 ---');
        console.log(groot.sub_skill_2 || 'NO SUB SKILL 2 FOUND');
        
        console.log('\n--- UNITY EFFECT ---');
        console.log(groot.unity_effect || groot.unity_text || 'NO UNITY EFFECT FOUND');
        
        console.log('\n--- HAS UNITY FLAG ---');
        console.log('has_unity:', groot.has_unity);
        
        console.log('\n--- DESCRIPTION (Flavor Text) ---');
        console.log(groot.description || groot.flavor_text || 'NO DESCRIPTION FOUND');
        
        console.log('\n--- ALL FIELDS ---');
        console.log(Object.keys(groot).sort());
      } else {
        console.log('Groot not found in records');
      }
    } else {
      console.log('No document found');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
