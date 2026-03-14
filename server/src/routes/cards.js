const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// GET /api/cards - Get all cards with search & filter
router.get('/', async (req, res) => {
  try {
    const {
      search,
      faction,
      cost,
      costMin,
      costMax,
      type,
      rarity,
      sort = 'name',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Text search (name, nameTh, description)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { nameTh: searchRegex },
        { description: searchRegex },
        { descriptionTh: searchRegex },
        { keywords: searchRegex },
      ];
    }

    // Filter by faction
    if (faction && faction !== 'all') {
      query.faction = faction;
    }

    // Filter by exact cost
    if (cost !== undefined && cost !== '' && cost !== 'all') {
      query.cost = Number(cost);
    }

    // Filter by cost range
    if (costMin !== undefined || costMax !== undefined) {
      query.cost = {};
      if (costMin !== undefined) query.cost.$gte = Number(costMin);
      if (costMax !== undefined) query.cost.$lte = Number(costMax);
    }

    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by rarity
    if (rarity && rarity !== 'all') {
      query.rarity = rarity;
    }

    // Sorting
    const sortOptions = {
      name: { name: 1 },
      cost_asc: { cost: 1 },
      cost_desc: { cost: -1 },
      rarity: { rarity: -1 },
      power: { power: -1 },
    };
    const sortQuery = sortOptions[sort] || { name: 1 };

    const total = await Card.countDocuments(query);
    const cards = await Card.find(query)
      .sort(sortQuery)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      cards,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cards/factions - Get all unique factions
router.get('/factions', async (req, res) => {
  try {
    const factions = await Card.distinct('faction');
    res.json(factions.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cards/:id - Get single card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cards - Create card (admin)
router.post('/', async (req, res) => {
  try {
    const card = new Card(req.body);
    const saved = await card.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
