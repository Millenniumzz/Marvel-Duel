const mongoose = require('mongoose');

const metaDeckSchema = new mongoose.Schema(
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
    descriptionTh: {
      type: String,
      default: '',
    },
    faction: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ['S', 'A', 'B', 'C'],
      default: 'B',
    },
    winRate: {
      type: Number,
      default: 0,
    },
    playstyle: {
      type: String,
      default: '',
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
        },
        role: {
          type: String,
          default: '',
        },
      },
    ],
    coverImage: {
      type: String,
      default: '',
    },
    patch: {
      type: String,
      default: '1.0',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MetaDeck', metaDeckSchema);
