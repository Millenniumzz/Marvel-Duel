const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');

// GET /api/decks - Get all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find()
      .populate('cards.card')
      .sort({ createdAt: -1 });
    res.json(decks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/decks/:id - Get single deck
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id).populate('cards.card');
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/decks - Save a deck
router.post('/', async (req, res) => {
  try {
    const { name, description, faction, cards, author } = req.body;

    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

    const deck = new Deck({
      name,
      description,
      faction,
      cards,
      totalCards,
      author: author || 'Anonymous',
    });

    const saved = await deck.save();
    const populated = await Deck.findById(saved._id).populate('cards.card');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/decks/:id - Update deck
router.put('/:id', async (req, res) => {
  try {
    const { name, description, faction, cards, author } = req.body;
    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { name, description, faction, cards, totalCards, author },
      { new: true }
    ).populate('cards.card');

    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/decks/:id - Delete deck
router.delete('/:id', async (req, res) => {
  try {
    const deck = await Deck.findByIdAndDelete(req.params.id);
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json({ message: 'Deck deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/decks/:id/like - Like a deck
router.post('/:id/like', async (req, res) => {
  try {
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json({ likes: deck.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
