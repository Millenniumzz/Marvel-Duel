/**
 * Scrape card images from Marvel Fandom Wiki
 * 
 * Automatically fetches card names and image URLs from:
 * https://marvel.fandom.com/wiki/Marvel_Duel/Gallery
 * 
 * NOTE: Fandom may block automated requests. Alternative methods:
 * 1. Use Fandom API
 * 2. Manually save HTML and parse locally
 * 3. Use browser DevTools to extract mapping
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { updateCardImagesByNumber } = require('./updateImagesByNumber');

const GALLERY_URL = 'https://marvel.fandom.com/wiki/Marvel_Duel/Gallery';
const FANDOM_API_URL = 'https://marvel.fandom.com/api.php';

/**
 * Method 1: Use Fandom API to get images
 */
async function scrapeViaAPI() {
  try {
    console.log('🔍 Fetching images via Fandom API...');
    
    // Get page content via API
    const response = await axios.get(FANDOM_API_URL, {
      params: {
        action: 'parse',
        page: 'Marvel_Duel/Gallery',
        format: 'json',
        prop: 'text|images'
      },
      headers: {
        'User-Agent': 'MarvelDuelBot/1.0 (Educational Project)'
      }
    });

    if (response.data.error) {
      throw new Error(response.data.error.info);
    }

    const data = response.data.parse;
    const imageMapping = {};

    // Get list of images from the page
    if (data.images && data.images.length > 0) {
      console.log(`📸 Found ${data.images.length} images on the page`);
      
      // For each image, get its info
      for (const imageName of data.images) {
        if (imageName.includes('Marvel_Duel_Card')) {
          // Get image info
          const infoResponse = await axios.get(FANDOM_API_URL, {
            params: {
              action: 'query',
              titles: `File:${imageName}`,
              prop: 'imageinfo',
              iiprop: 'url',
              format: 'json'
            }
          });

          const pages = infoResponse.data.query.pages;
          const pageId = Object.keys(pages)[0];
          
          if (pages[pageId].imageinfo) {
            const imageUrl = pages[pageId].imageinfo[0].url;
            
            // Extract card number from filename
            const cardMatch = imageName.match(/Marvel_Duel_Card_(\d+)/);
            if (cardMatch) {
              const cardNumber = cardMatch[1]; // Just the number, e.g., "0645"
              imageMapping[cardNumber] = imageUrl;
              console.log(`  ✓ ${cardNumber} -> ${imageUrl.substring(0, 60)}...`);
            }
          }
        }
      }
    }

    return imageMapping;
  } catch (error) {
    console.error('❌ API method failed:', error.message);
    throw error;
  }
}

/**
 * Method 2: Parse locally saved HTML file
 */
async function scrapeFromLocalFile() {
  try {
    const htmlPath = path.join(__dirname, 'gallery.html');
    console.log('📂 Reading local HTML file:', htmlPath);
    
    const html = await fs.readFile(htmlPath, 'utf-8');
    const $ = cheerio.load(html);
    const imageMapping = {};
    let foundCount = 0;

    // Find all images with Marvel_Duel_Card in the src
    $('img').each((index, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src');
      const alt = $(element).attr('alt') || '';
      
      if (src && src.includes('Marvel_Duel_Card')) {
        let imageUrl = src;
        
        // Clean up URL
        if (imageUrl.includes('/revision/')) {
          imageUrl = imageUrl.split('/revision/')[0];
        }
        if (!imageUrl.startsWith('http')) {
          imageUrl = 'https:' + imageUrl;
        }
        
        // Extract card name
        let cardName = alt.replace(/File:|\.jpg|\.png/gi, '').trim();
        
        if (!cardName) {
          const match = src.match(/Marvel_Duel_Card_(\d+)/);
          if (match) {
            cardName = `Card_${match[1]}`;
          }
        }
        
        if (cardName && !imageMapping[cardName]) {
          imageMapping[cardName] = imageUrl;
          foundCount++;
          console.log(`  ✓ ${cardName}`);
        }
      }
    });

    console.log(`\n✅ Found ${foundCount} images`);
    return imageMapping;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ File not found. Please save the gallery page as gallery.html in the scripts folder.');
      console.log('\n📝 Steps:');
      console.log('   1. Open: ' + GALLERY_URL);
      console.log('   2. Right-click -> Save As -> gallery.html');
      console.log('   3. Save to: ' + path.join(__dirname));
      console.log('   4. Run this script again');
    }
    throw error;
  }
}

/**
 * Method 3: Manual mapping helper - generates template
 */
async function generateMappingTemplate() {
  console.log('\n📋 Manual Mapping Helper');
  console.log('================================\n');
  console.log('Since automated scraping is blocked, you can:');
  console.log('\n1️⃣  Use browser DevTools:');
  console.log('   - Open: ' + GALLERY_URL);
  console.log('   - Press F12 -> Console');
  console.log('   - Paste this code:\n');
  console.log('```javascript');
  console.log(`const mapping = {};
document.querySelectorAll('img').forEach(img => {
  if (img.src.includes('Marvel_Duel_Card')) {
    const url = img.src.split('/revision/')[0];
    const name = img.alt || img.title || url.match(/Card_(\\d+)/)?.[0];
    if (name) mapping[name] = url;
  }
});
console.log(JSON.stringify(mapping, null, 2));`);
  console.log('```\n');
  console.log('   - Copy the output');
  console.log('   - Save to sampleCardImages.json\n');
  
  console.log('2️⃣  Or use the Fandom API method (try again)\n');
  console.log('3️⃣  Or save HTML locally and parse it\n');
}

/**
 * Main scraping function with fallback methods
 */
async function scrapeCardImages() {
  // Try Method 1: Fandom API
  try {
    console.log('🎯 Method 1: Trying Fandom API...\n');
    return await scrapeViaAPI();
  } catch (error) {
    console.log('⚠️  API method failed, trying next method...\n');
  }

  // Try Method 2: Local HTML file
  try {
    console.log('🎯 Method 2: Trying local HTML file...\n');
    return await scrapeFromLocalFile();
  } catch (error) {
    console.log('⚠️  Local file method failed\n');
  }

  // Method 3: Show manual instructions
  await generateMappingTemplate();
  return null;
}

/**
 * Scrape and update database with card images
 */
async function scrapeAndUpdate() {
  const mongoose = require('mongoose');
  
  try {
    console.log('🚀 Starting Marvel Duel card image scraper...\n');
    
    // Scrape images from gallery
    const imageMapping = await scrapeCardImages();
    
    if (!imageMapping || Object.keys(imageMapping).length === 0) {
      console.log('\n⚠️  No images found or all methods failed.');
      console.log('💡 Please follow the manual instructions above.');
      return;
    }

    console.log('\n📝 Found ' + Object.keys(imageMapping).length + ' card images\n');
    
    // Show first few as sample
    const samples = Object.entries(imageMapping).slice(0, 5);
    console.log('Sample mappings (card number -> URL):');
    samples.forEach(([cardNumber, url]) => {
      console.log(`  ${cardNumber} -> ${url.substring(0, 70)}...`);
    });
    
    console.log('\n💾 Connecting to database...');
    
    // Connect to MongoDB
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Deck');
    console.log('✅ Connected to database');
    
    console.log('📝 Updating card images by card number...');
    
    // Update database with scraped images using card numbers
    const result = await updateCardImagesByNumber(imageMapping);
    
    console.log('\n✅ Database update complete!');
    console.log(`   Updated: ${result.totalUpdated} cards`);
    
    if (result.updatedDetails.length > 0) {
      console.log(`\n📋 Updated cards:`);
      result.updatedDetails.forEach(detail => {
        console.log(`   ✓ [${detail.cardNumber}] ${detail.cardName} (${detail.collection})`);
      });
    }
    
    if (result.notFoundCards.length > 0) {
      console.log(`\n⚠️  Card numbers not found in database (${result.notFoundCards.length}):`);
      result.notFoundCards.slice(0, 10).forEach(cardNum => {
        console.log(`   - ${cardNum}`);
      });
      if (result.notFoundCards.length > 10) {
        console.log(`   ... and ${result.notFoundCards.length - 10} more`);
      }
      console.log('\n💡 Tip: These card numbers exist in the wiki but not in your database yet.');
    }

    console.log('\n🎉 Done!');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  scrapeAndUpdate();
}

module.exports = { scrapeCardImages, scrapeAndUpdate };
