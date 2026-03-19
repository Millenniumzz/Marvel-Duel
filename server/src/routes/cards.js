const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const mongoose = require('mongoose');

// List of all deck collections
const DECK_COLLECTIONS = [
  'GuardiansoftheGalaxy',
  'Asgardian',
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

// Helper function to get card type for sorting
const getCardTypeForSorting = (card) => {
  return card.type;
};

// Helper function to get type sort order
const getTypeSortOrder = (type) => {
  const order = {
    'Character': 1,
    'Equipment': 2,
    'Pow': 3,
    'Tactics Card': 4,
  };
  return order[type] || 999;
};

// Helper function to get rarity sort order
const getRaritySortOrder = (rarity) => {
  const order = {
    'Legendary': 1,
    'Epic': 2,
    'Rare': 3,
    'Common': 4,
    'Multiverse': 5,
  };
  return order[rarity] || 999;
};

// Helper function to get card ID for sorting
const getCardIdForSorting = (card) => {
  // Try card_number first
  if (card.card_number) {
    const numStr = card.card_number.replace(/\D/g, '');
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) return num;
  }
  
  // Try record_id
  if (card.record_id) {
    return card.record_id;
  }
  
  // Try _id if it's numeric
  if (card._id) {
    const num = parseInt(card._id, 10);
    if (!isNaN(num)) return num;
  }
  
  return 999999;
};

// Standard card sorting comparator
const compareCards = (a, b) => {
  // 1. Sort by cost (ascending)
  const costDiff = (a.cost || 0) - (b.cost || 0);
  if (costDiff !== 0) return costDiff;
  
  // 2. Sort by type order
  const typeA = getCardTypeForSorting(a);
  const typeB = getCardTypeForSorting(b);
  const typeOrderDiff = getTypeSortOrder(typeA) - getTypeSortOrder(typeB);
  if (typeOrderDiff !== 0) return typeOrderDiff;
  
  // 3. Sort by rarity
  const rarityOrderDiff = getRaritySortOrder(a.rarity) - getRaritySortOrder(b.rarity);
  if (rarityOrderDiff !== 0) return rarityOrderDiff;
  
  // 4. Sort by card ID
  return getCardIdForSorting(a) - getCardIdForSorting(b);
};

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
      battle_style,
      sort = 'name',
      page = 1,
      limit = 24,
    } = req.query;

    // Determine which collections to query
    let collectionsToQuery = DECK_COLLECTIONS;
    
    // If faction filter is specified, only query matching collections
    if (faction && faction !== 'all') {
      const collectionName = faction.replace(/[^a-zA-Z0-9]/g, '');
      if (DECK_COLLECTIONS.includes(collectionName)) {
        collectionsToQuery = [collectionName];
      }
    }

    // Query all relevant collections directly
    let allCards = [];
    const db = mongoose.connection.db;
    
    for (const collName of collectionsToQuery) {
      try {
        const collection = db.collection(collName);
        const docs = await collection.find({}).toArray();
        
        // Check if collection uses "records" array structure
        if (docs.length > 0 && docs[0].records && Array.isArray(docs[0].records)) {
          // Extract from records array (old structure)
          docs.forEach(doc => {
            if (doc.records) {
              allCards.push(...doc.records);
            }
          });
        } else {
          // Flat structure (1 doc = 1 card)
          allCards.push(...docs);
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
      filteredCards = filteredCards.filter(card => {
        const name = card.name || card.display_name || '';
        const desc = card.description || card.flavor_text || '';
        const keywords = Array.isArray(card.keywords_mechanic) ? card.keywords_mechanic.join(' ') : '';
        return name.toLowerCase().includes(searchLower) || 
               desc.toLowerCase().includes(searchLower) ||
               keywords.toLowerCase().includes(searchLower);
      });
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
    
    // Battle Style filter
    if (battle_style && battle_style !== 'all') {
      filteredCards = filteredCards.filter(card => card.battle_style === battle_style);
    }

    // Map cards to response format
    filteredCards = filteredCards.map(record => ({
      _id: record._id || record.record_id,
      card_id: record.card_id,
      record_id: record.record_id,
      name: record.name || record.display_name || record.base_card_name,
      base_card_name: record.base_card_name,
      display_name: record.display_name,
      nameTh: record.nameTh || '',
      faction: record.faction || record.deck_name,
      deck_name: record.deck_name,
      deck_group: record.deck_group,
      cost: parseInt(record.cost) || 0,
      type: record.type || 'Character',
      power: parseInt(record.attack) || 0,
      health: parseInt(record.armor) || 0,
      attack: parseInt(record.attack) || 0,
      armor: parseInt(record.armor) || 0,
      description: record.description || record.flavor_text || '',
      descriptionTh: record.descriptionTh || record.description_th || record.flavor_text_th || '',
      ability: record.ability,
      ability_text: record.ability_text || record.ability,
      sub_skill_1: record.sub_skill_1,
      sub_skill_2: record.sub_skill_2,
      unity_effect: record.unity_effect,
      unity_text: record.unity_text || record.unity_effect,
      unity_member: record.unity_member,
      unity_effect_2: record.unity_effect_2,
      unity_member_2: record.unity_member_2,
      unity_effect_3: record.unity_effect_3,
      unity_member_3: record.unity_member_3,
      battle_style: record.battle_style,
      image: record.image || record.image_url || '',
      image_url: record.image_url,
      card_number: record.card_number,
      rarity: record.rarity || 'Common',
      keywords: Array.isArray(record.keywords_mechanic) ? record.keywords_mechanic.join(', ') : (record.keywords || ''),
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

    // Sort results using standard sorting (Cost -> Type -> Rarity -> Card ID)
    filteredCards.sort(compareCards);

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
              cost: parseInt(record.cost) || 0,
              type: record.type || 'Character',
              power: parseInt(record.attack) || 0,
              health: parseInt(record.armor) || 0,
              attack: record.attack,
              armor: record.armor,
              description: record.ability_text || '',
              ability_text: record.ability_text,
              unity_text: record.unity_text,
              battle_style: record.battle_style,
              image: record.image_url || '',
              rarity: record.rarity || 'Common',
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
