const mongoose = require('mongoose');
const Card = require('../src/models/Card');
require('dotenv').config();

// Keywords to extract from ability text
const KEYWORD_MECHANICS = [
  'Invocation', 'Unity', 'Last Words', 'Bounty', 'Bounty Hunter', 'Triumph',
  'Assault', 'Defeat', 'Stunned', 'Tried and True', 'Decay', 'Guard',
  'Iron Will', 'Retaliate', 'Burst', 'Awaken', 'Pierce', 'Collection',
  'Illusion', 'Critical Hit', 'Reinforcement', 'Assemble', 'Annihilate',
  'Speed Strike', 'Lore', 'Special Action', 'Forerunner', 'Visionary',
  'Cloaked', 'Puncture', 'Flanker', 'Enhance', 'unique effect', 'Teleport',
  'Inhibited', 'Beast', 'Sacrifice', 'Maverick', 'Quest', 'Inhibition Layer',
  'Lock-On', 'Alpha Power', 'Ranged', 'Intelligence', 'Time reversion',
  'Inspire', 'Ongoing', 'Resurrect', 'Big Idea', 'Genius Idea', 'Triple Alliance',
  'Magnetic Equipment', 'Magnetic Warrior', 'On Reveal', 'Miracle', 'Infinity Stones',
  'Surge', 'Shark Treasure', 'United Front'
];

// Extract keywords from card text fields
function extractKeywords(cardData) {
  const keywords = new Set();
  
  // Combine all text fields
  const textFields = [
    cardData.ability,
    cardData.ability_text,
    cardData.sub_skill_1,
    cardData.sub_skill_2,
    cardData.unity_effect,
    cardData.unity_effect_2,
    cardData.unity_effect_3,
    cardData.unity_text
  ].filter(Boolean).join(' ');
  
  if (!textFields) return [];
  
  // Check each keyword
  KEYWORD_MECHANICS.forEach(keyword => {
    // Case-insensitive word boundary match
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textFields)) {
      keywords.add(keyword);
    }
  });
  
  return Array.from(keywords).sort();
}

async function updateKeywords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marvel-duel');
    console.log('✅ Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const cardCollections = collections
      .map(col => col.name)
      .filter(name => !name.startsWith('system.'));
    
    console.log(`\n📦 Found ${cardCollections.length} collections to process`);
    
    let totalUpdated = 0;
    let totalProcessed = 0;
    
    // Process each collection
    for (const collectionName of cardCollections) {
      console.log(`\n🔄 Processing collection: ${collectionName}`);
      
      // Use raw MongoDB collection
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Get ALL cards (both nested and flat structure)
      const cards = await collection.find({}).toArray();
      console.log(`   Found ${cards.length} documents`);
      
      // Update each document
      for (const card of cards) {
        // Check if this is nested structure (has records array)
        if (card.records && Array.isArray(card.records) && card.records.length > 0) {
          // === NESTED STRUCTURE: Process records array ===
          let hasChanges = false;
          
          for (let i = 0; i < card.records.length; i++) {
            const record = card.records[i];
            totalProcessed++;
            
            const cardName = record.display_name || record.base_card_name || record.name || 'No name';
            
            // Extract keywords from this record
            const keywords = extractKeywords(record);
            
            // Update if keywords found
            if (keywords.length > 0) {
              const existingKeywords = record.keywords_mechanic || [];
              const keywordsChanged = JSON.stringify(existingKeywords.sort()) !== JSON.stringify(keywords);
              
              if (keywordsChanged) {
                // Update the record's keywords
                card.records[i].keywords_mechanic = keywords;
                hasChanges = true;
                totalUpdated++;
                console.log(`   ✓ ${cardName} (${record.card_id || 'nested'}): [${keywords.join(', ')}]`);
              }
            }
          }
          
          // Save changes if any
          if (hasChanges) {
            await collection.updateOne(
              { _id: card._id },
              { $set: { records: card.records } }
            );
          }
        } else {
          // === FLAT STRUCTURE: Process document directly ===
          // Skip if this is just metadata/empty document
          const cardName = card.display_name || card.base_card_name || card.name;
          if (!cardName) {
            continue; // Skip documents without card data
          }
          
          totalProcessed++;
          
          // Extract keywords from card
          const keywords = extractKeywords(card);
          
          // Update if keywords found
          if (keywords.length > 0) {
            const existingKeywords = card.keywords_mechanic || [];
            const keywordsChanged = JSON.stringify(existingKeywords.sort()) !== JSON.stringify(keywords);
            
            if (keywordsChanged) {
              // Update the card's keywords
              await collection.updateOne(
                { _id: card._id },
                { $set: { keywords_mechanic: keywords } }
              );
              totalUpdated++;
              console.log(`   ✓ ${cardName} (${card.card_id || card._id}): [${keywords.join(', ')}]`);
            }
          }
        }
      }
    }
    
    console.log(`\n✅ Extraction complete!`);
    console.log(`   Total cards processed: ${totalProcessed}`);
    console.log(`   Total cards updated: ${totalUpdated}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
updateKeywords();
