const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const mongoose = require('mongoose');

// List of all deck collections
const DECK_COLLECTIONS = [
  'GuardiansoftheGalaxy',
  'Asgard',
  'IntergalacticWar',
  'StarkIndustries',
  'SpiderVerse',
  'Ragnarok',
  'MarvelKnights',
  'Agents',
  'Mystics',
  'Eternals',
  'XMen',
  'DeadpoolCorps',
  'Brotherhood',
  'Neutral',
  'Special',
  'Collaboration',
];

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
      limit = 24,
    } = req.query;

    // Determine which collections to query
    let collectionsToQuery = DECK_COLLECTIONS;
    
    // If faction filter is specified, only query that collection
    if (faction && faction !== 'all') {
      const collectionName = faction.replace(/[^a-zA-Z0-9]/g, '');
      collectionsToQuery = [collectionName];
    }

    // Query all relevant collections and extract records
    let allCards = [];
    for (const collName of collectionsToQuery) {
      try {
        const db = mongoose.connection.db;
        const collection = db.collection(collName);
        
        // Get the deck document
        const deckDoc = await collection.findOne({});
        
        if (deckDoc && deckDoc.records && Array.isArray(deckDoc.records)) {
          // Extract records and map to card format
          const cards = deckDoc.records.map(record => ({
            _id: record.record_id || record._id,
            card_id: record.card_id,
            record_id: record.record_id,
            name: record.display_name || record.base_card_name,
            base_card_name: record.base_card_name,
            display_name: record.display_name,
            nameTh: '', // ไม่มีในข้อมูลใหม่
            faction: record.faction || record.deck_name,
            deck_name: record.deck_name,
            deck_group: record.deck_name,
            cost: parseInt(record.cost) || 0,
            type: 'Character', // default - could infer from data later
            power: parseInt(record.attack) || 0,
            health: parseInt(record.armor) || 0,
            attack: parseInt(record.attack) || 0,
            armor: parseInt(record.armor) || 0,
            description: record.ability || record.ability_text || '',
            ability: record.ability,
            ability_text: record.ability_text || record.ability,
            sub_skill_1: record.sub_skill_1,
            sub_skill_2: record.sub_skill_2,
            unity_effect: record.unity_effect,
            unity_text: record.unity_text || record.unity_effect,
            unity_member: record.unity_member,
            battle_style: record.battle_style,
            image: record.image_url || '',
            image_url: record.image_url,
            card_number: record.card_number,
            rarity: record.rarity || 'Common',
            keywords: record.keywords_mechanic ? record.keywords_mechanic.join(', ') : '',
            keywords_mechanic: record.keywords_mechanic || record.keyword_mechanic || [],
            keywords_team: record.keywords_team || [],
            keyword_mechanic: record.keyword_mechanic || record.keywords_mechanic || [],
            has_unity: record.has_unity || false,
            variant_type: record.variant_type,
            variant_label: record.variant_label,
            availability_status: record.availability_status,
            patch_version: record.patch_version,
            source_type: record.source_type,
            inference_confidence: record.inference_confidence,
            needs_manual_verification: record.needs_manual_verification,
          }));
          
          allCards = allCards.concat(cards);
        }
      } catch (err) {
        console.warn(`Warning: Could not query collection ${collName}:`, err.message);
      }
    }

    // Apply filters
    let filteredCards = allCards;

    // Text search
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filteredCards = filteredCards.filter(card => 
        (card.name && card.name.toLowerCase().includes(searchLower)) ||
        (card.description && card.description.toLowerCase().includes(searchLower)) ||
        (card.keywords && card.keywords.toLowerCase().includes(searchLower))
      );
    }

    // Cost filter
    if (cost !== undefined && cost !== '' && cost !== 'all') {
      filteredCards = filteredCards.filter(card => card.cost === Number(cost));
    }

    // Type filter
    if (type && type !== 'all') {
      filteredCards = filteredCards.filter(card => card.type === type);
    }

    // Rarity filter
    if (rarity && rarity !== 'all') {
      filteredCards = filteredCards.filter(card => card.rarity === rarity);
    }

    // Sort results
    filteredCards.sort((a, b) => {
      if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'cost_asc') return (a.cost || 0) - (b.cost || 0);
      if (sort === 'cost_desc') return (b.cost || 0) - (a.cost || 0);
      if (sort === 'power') return (b.power || 0) - (a.power || 0);
      return 0;
    });

    // Paginate
    const total = filteredCards.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const cards = filteredCards.slice(startIndex, endIndex);

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
    // Return list of deck collections as factions
    const factions = DECK_COLLECTIONS.map(coll => {
      // Convert collection name back to readable format
      return coll
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/\s+/g, ' ');
    });
    res.json(factions.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cards/:id - Get single card by ID
router.get('/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const searchId = req.params.id;
    
    // Search across all collections
    let foundCard = null;
    
    for (const collName of DECK_COLLECTIONS) {
      try {
        const collection = db.collection(collName);
        const deckDoc = await collection.findOne({});
        
        if (deckDoc && deckDoc.records && Array.isArray(deckDoc.records)) {
          // Find record by record_id
          const record = deckDoc.records.find(r => 
            String(r.record_id) === searchId || 
            String(r._id) === searchId
          );
          
          if (record) {
            // Map to card format
            foundCard = {
              _id: record.record_id || record._id,
              name: record.display_name || record.base_card_name,
              nameTh: '',
              faction: record.faction || record.deck_name,
              deck_group: record.deck_name,
              cost: parseInt(record.cost_red_gem) || 0,
              type: 'Character',
              power: parseInt(record.attack) || 0,
              health: 0,
              attack: record.attack,
              armor: record.armor,
              description: record.ability_text || '',
              ability_text: record.ability_text,
              unity_text: record.unity_text,
              battle_style: record.battle_style,
              image: record.image_url || '',
              rarity: 'Common',
              keywords: record.keywords_mechanic ? record.keywords_mechanic.join(', ') : '',
              has_unity: record.has_unity,
              variant_type: record.variant_type,
              variant_label: record.variant_label,
            };
            break;
          }
        }
      } catch (err) {
        console.warn(`Warning: Error searching in ${collName}:`, err.message);
      }
    }
    
    if (!foundCard) return res.status(404).json({ message: 'Card not found' });
    res.json(foundCard);
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
