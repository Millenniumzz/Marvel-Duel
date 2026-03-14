const express = require('express');
const router = express.Router();
const MetaDeck = require('../models/MetaDeck');

// GET /api/meta-decks - Get all meta decks
router.get('/', async (req, res) => {
  try {
    const { tier, faction } = req.query;
    const query = {};

    if (tier && tier !== 'all') query.tier = tier;
    if (faction && faction !== 'all') query.faction = faction;

    const metaDecks = await MetaDeck.find(query)
      .populate('cards.card')
      .sort({ tier: 1, winRate: -1 });

    res.json(metaDecks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/meta-decks/:id - Get single meta deck
router.get('/:id', async (req, res) => {
  try {
    const metaDeck = await MetaDeck.findById(req.params.id).populate('cards.card');
    if (!metaDeck) return res.status(404).json({ message: 'Meta deck not found' });
    res.json(metaDeck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/meta-decks - Create meta deck (admin)
router.post('/', async (req, res) => {
  try {
    const metaDeck = new MetaDeck(req.body);
    const saved = await metaDeck.save();
    const populated = await MetaDeck.findById(saved._id).populate('cards.card');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
