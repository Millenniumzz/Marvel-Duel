const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    faction: {
      type: String,
      default: 'Mixed',
    },
    cards: [
      {
        card: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Card',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
          max: 3,
        },
      },
    ],
    totalCards: {
      type: Number,
      default: 0,
    },
    author: {
      type: String,
      default: 'Anonymous',
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deck', deckSchema);
