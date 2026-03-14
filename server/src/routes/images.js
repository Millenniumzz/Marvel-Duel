const express = require('express');
const router = express.Router();
const axios = require('axios');

// In-memory cache for card image URLs (expires after 24 hours)
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get card image URL by card number
 * GET /api/images/card/:cardNumber
 * 
 * Example: /api/images/card/0645
 * Returns: { cardNumber: "0645", imageUrl: "https://...", cached: true }
 */
router.get('/card/:cardNumber', async (req, res) => {
  try {
    const { cardNumber } = req.params;

    // Validate card number format (should be 4 digits)
    if (!/^\d{4}$/.test(cardNumber)) {
      return res.status(400).json({ 
        message: 'Invalid card number format. Expected 4 digits (e.g., 0645)' 
      });
    }

    // Check cache first
    const cacheKey = `card_${cardNumber}`;
    const cached = imageCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return res.json({
        cardNumber,
        imageUrl: cached.url,
        cached: true
      });
    }

    // Search Fandom API for the card image
    const imageName = `Marvel_Duel_Card_${cardNumber}.jpg`;
    
    const response = await axios.get('https://marvel.fandom.com/api.php', {
      params: {
        action: 'query',
        titles: `File:${imageName}`,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json'
      },
      headers: {
        'User-Agent': 'MarvelDuelBot/1.0 (Educational Project)'
      },
      timeout: 10000
    });

    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    // Check if image exists
    if (pageId === '-1' || !pages[pageId].imageinfo) {
      return res.status(404).json({ 
        message: `Card image not found for card number: ${cardNumber}`,
        cardNumber 
      });
    }

    const imageUrl = pages[pageId].imageinfo[0].url;

    // Cache the result
    imageCache.set(cacheKey, {
      url: imageUrl,
      timestamp: Date.now()
    });

    res.json({
      cardNumber,
      imageUrl,
      cached: false
    });

  } catch (err) {
    console.error('Card image lookup error:', err.message);
    res.status(500).json({ 
      message: 'Failed to fetch card image',
      error: err.message 
    });
  }
});

/**
 * Image proxy route
 * GET /api/images/proxy?url=https://static.wikia.nocookie.net/.../Card_0013.jpg
 * 
 * Proxies image requests to avoid CORS and hotlinking issues
 */
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'Missing url parameter' });
    }

    // Validate URL (only allow Wikia)
    if (!url.startsWith('https://static.wikia.nocookie.net/')) {
      return res.status(403).json({ message: 'Invalid image source' });
    }

    // Fetch image from Wikia
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://marvel.fandom.com/'
      },
      timeout: 10000 // 10 seconds
    });

    // Forward the image
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cache 1 day
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(response.data);

  } catch (err) {
    console.error('Image proxy error:', err.message);
    
    // Return placeholder or error
    res.status(500).json({ 
      message: 'Failed to load image',
      error: err.message 
    });
  }
});

/**
 * Get card number from Wikia filename
 * https://static.wikia.../Marvel_Duel_Card_0645.jpg → 0645
 */
function extractCardNumber(url) {
  const match = url.match(/Marvel_Duel_Card_(\d{4})/);
  return match ? match[1] : null;
}

module.exports = router;
