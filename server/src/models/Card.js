const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameTh: {
      type: String,
      trim: true,
    },
    faction: {
      type: String,
      required: true,
      enum: [
        'Agents',
        'Asgard',
        'Avengers',
        'Brotherhood',
        'Collaboration',
        'Deadpool Corps',
        'Eternals',
        'Guardians of the Galaxy',
        'Hydra',
        'Intergalactic War',
        'Marvel Knights',
        'Mystics',
        'Neutral',
        'Ragnarok',
        'S.H.I.E.L.D.',
        'Special',
        'Spider-Verse',
        'Stark Industries',
        'Villains',
        'Wakanda',
        'X-Men',
      ],
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    type: {
      type: String,
      enum: ['Character', 'Action', 'Equip'],
      required: true,
    },
    power: {
      type: Number,
      default: 0,
    },
    health: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    descriptionTh: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Multiverse'],
      default: 'Common',
    },
    keywords: {
      type: String,
      default: '',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    // New fields from MongoDB
    deck_group: {
      type: String,
      default: '',
    },
    source_section: {
      type: String,
      default: '',
    },
    availability_status: {
      type: String,
      default: 'Active',
    },
    cost: {
      type: String,
      default: '',
    },
    attack: {
      type: String,
      default: '',
    },
    armor: {
      type: String,
      default: '',
    },
    battle_style: {
      type: String,
      default: '',
    },
    ability_text: {
      type: String,
      default: '',
    },
    unity_text: {
      type: String,
      default: '',
    },
    has_unity: {
      type: String,
      default: '',
    },
    source_url: {
      type: String,
      default: '',
    },
    last_verified: {
      type: String,
      default: '',
    },
    completeness: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    inferred_variant_flag: {
      type: Boolean,
      default: false,
    },
    inferred_multiverse_flag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Text index for search
cardSchema.index({ name: 'text', nameTh: 'text', description: 'text', descriptionTh: 'text' });

// Export model factory that can use different collection names
const Card = mongoose.model('Card', cardSchema);

// Helper function to get model for specific deck collection
Card.forDeck = function(deckName) {
  const collectionName = deckName.replace(/[^a-zA-Z0-9]/g, '');
  return mongoose.model(`Card_${collectionName}`, cardSchema, collectionName);
};

module.exports = Card;
