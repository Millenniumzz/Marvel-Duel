/**
 * Admin API for updating card images
 * Uses shared updateCardImages function
 */

const express = require('express');
const router = express.Router();
const { updateCardImages } = require('../../scripts/updateImages');

// POST /api/admin/update-image - Update single card image
router.post('/update-image', async (req, res) => {
  try {
    const { cardName, imageUrl } = req.body;

    if (!cardName || !imageUrl) {
      return res.status(400).json({ 
        message: 'Missing cardName or imageUrl' 
      });
    }

    const imageMapping = { [cardName]: imageUrl };
    const result = await updateCardImages(imageMapping);

    if (result.totalUpdated > 0) {
      res.json({ 
        success: true,
        message: `Updated image for "${cardName}"`,
        cardName,
        imageUrl,
        collection: result.updatedDetails[0]?.collection
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: `Card "${cardName}" not found in any collection` 
      });
    }

  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// POST /api/admin/update-images-bulk - Update multiple card images
router.post('/update-images-bulk', async (req, res) => {
  try {
    const { images } = req.body; // Array of { cardName, imageUrl }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ 
        message: 'images must be a non-empty array' 
      });
    }

    // Convert array to mapping object
    const imageMapping = {};
    images.forEach(({ cardName, imageUrl }) => {
      imageMapping[cardName] = imageUrl;
    });

    const result = await updateCardImages(imageMapping);

    res.json({
      success: true,
      totalUpdated: result.totalUpdated,
      updated: result.updatedDetails.map(d => d.name),
      notFound: result.notFoundCards
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;
