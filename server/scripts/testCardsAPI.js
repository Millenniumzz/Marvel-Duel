#!/usr/bin/env node

/**
 * Quick test to verify Backend sends card_number to Frontend
 */

const axios = require('axios');

async function testCardsAPI() {
  try {
    console.log('🧪 Testing /api/cards endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/cards', {
      params: {
        faction: 'Guardians of the Galaxy'
      }
    });
    
    console.log(`✅ Found ${response.data.length} cards\n`);
    
    // Check first few cards
    const cardsToCheck = response.data.slice(0, 5);
    
    console.log('📋 Checking card_number field:\n');
    cardsToCheck.forEach(card => {
      console.log(`   Card: ${card.name}`);
      console.log(`   ├─ card_number: ${card.card_number || '❌ MISSING'}`);
      console.log(`   ├─ image: ${card.image ? 'has URL' : 'no URL'}`);
      console.log(`   └─ faction: ${card.faction}\n`);
    });
    
    // Summary
    const withCardNumber = response.data.filter(c => c.card_number).length;
    const total = response.data.length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Cards with card_number: ${withCardNumber}/${total}`);
    
    if (withCardNumber === 0) {
      console.log(`\n❌ Problem: Backend is NOT sending card_number`);
      console.log(`   → Check server/src/routes/cards.js`);
      console.log(`   → Make sure card_number is in the mapping`);
    } else if (withCardNumber < total) {
      console.log(`\n⚠️  Some cards missing card_number`);
      console.log(`   → Run: node scripts/addCardNumbers.js`);
    } else {
      console.log(`\n✅ All cards have card_number!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure backend server is running on port 5000');
      console.log('   Run: cd server && npm start');
    }
  }
}

testCardsAPI();
