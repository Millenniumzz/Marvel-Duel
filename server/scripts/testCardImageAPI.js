#!/usr/bin/env node

/**
 * Test script for Card Image API
 * Tests the /api/images/card/:cardNumber endpoint
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testCardImage(cardNumber) {
  try {
    console.log(`\n🧪 Testing card number: ${cardNumber}`);
    const response = await axios.get(`${API_BASE}/api/images/card/${cardNumber}`);
    
    console.log('✅ Success!');
    console.log('   Card Number:', response.data.cardNumber);
    console.log('   Image URL:', response.data.imageUrl.substring(0, 80) + '...');
    console.log('   Cached:', response.data.cached);
    
    return true;
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data.message);
    } else {
      console.log('❌ Network error:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Card Image API Tests\n');
  console.log('Make sure backend server is running on port 5000!\n');
  
  // Test cards from database
  const testCards = [
    '0645', // Groot (Young)
    '0345', // Groot
    '0002', // Nebula
    '0001', // Groot
    '0013', // Adam Warlock
    '9999', // Should fail - not exist
  ];
  
  for (const cardNumber of testCards) {
    await testCardImage(cardNumber);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between requests
  }
  
  console.log('\n✅ Tests completed!');
  console.log('\nNow test in browser:');
  console.log(`   1. Open: http://localhost:5000/api/images/card/0645`);
  console.log(`   2. You should see JSON with imageUrl`);
  console.log(`   3. Then open Frontend and check if images load\n`);
}

main().catch(console.error);
