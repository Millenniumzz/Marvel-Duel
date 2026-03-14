/**
 * Update card images in database using card numbers
 * This version matches scraped images to database records by card_number field
 */

const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Update card images using card number mapping
 * @param {Object} cardNumberMapping - Object mapping card numbers to image URLs
 *                                    Example: { "0001": "https://...", "0645": "https://..." }
 * @returns {Object} Update results with statistics
 */
async function updateCardImagesByNumber(cardNumberMapping) {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Deck');
    }
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const allCollections = await db.listCollections().toArray();
    const collectionNames = allCollections.map(c => c.name);
    
    // Filter to only card collections
    const cardCollections = collectionNames.filter(name => 
      !['cards', 'decks', 'metadecks'].includes(name)
    );
    
    let totalUpdated = 0;
    let notFoundCards = [];
    let updatedDetails = [];
    
    // Process each collection
    for (const collectionName of cardCollections) {
      const collection = db.collection(collectionName);
      const deckDoc = await collection.findOne();
      
      if (!deckDoc || !deckDoc.records || deckDoc.records.length === 0) {
        continue;
      }
      
      let updatedInCollection = 0;
      
      // Update each record
      for (let i = 0; i < deckDoc.records.length; i++) {
        const record = deckDoc.records[i];
        const cardNumber = record.card_number;
        
        if (!cardNumber) {
          continue;
        }
        
        // Check if we have an image URL for this card number
        if (cardNumberMapping[cardNumber]) {
          const newImageUrl = cardNumberMapping[cardNumber];
          
          // Update both image_url and image_file fields
          deckDoc.records[i].image_url = newImageUrl;
          deckDoc.records[i].image_file = newImageUrl;
          
          updatedInCollection++;
          totalUpdated++;
          
          updatedDetails.push({
            collection: collectionName,
            cardNumber: cardNumber,
            cardName: record.base_card_name || record.display_name,
            imageUrl: newImageUrl
          });
        }
      }
      
      // Save updated document if any changes were made
      if (updatedInCollection > 0) {
        await collection.updateOne(
          { _id: deckDoc._id },
          { $set: { records: deckDoc.records, last_updated: new Date().toISOString().split('T')[0] } }
        );
      }
    }
    
    // Find cards in mapping that weren't found in database
    const mappedNumbers = Object.keys(cardNumberMapping);
    const usedNumbers = updatedDetails.map(d => d.cardNumber);
    notFoundCards = mappedNumbers.filter(num => !usedNumbers.includes(num));
    
    return {
      totalUpdated,
      notFoundCards,
      updatedDetails
    };
    
  } catch (error) {
    console.error('Error updating cards by number:', error.message);
    throw error;
  }
}

module.exports = { updateCardImagesByNumber };
