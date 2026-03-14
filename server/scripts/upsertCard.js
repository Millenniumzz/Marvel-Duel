require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../src/models/Card');

async function upsert() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Card');
    const doc = {
      name: payload.card_name,
      deck_group: payload.deck_group,
      source_section: payload.source_section,
      availability_status: payload.availability_status,
      cost_red_gem: payload.cost_red_gem,
      attack: payload.attack,
      armor: payload.armor,
      battle_style: payload.battle_style,
      ability_text: payload.ability_text,
      unity_text: payload.unity_text,
      keywords: payload.keywords,
      has_unity: payload.has_unity,
      source_url: payload.source_url,
      faction: payload.deck_group || 'Neutral',
      cost: 0,
      type: 'Character',
      power: 0,
      health: 0,
      rarity: 'Common',
      description: '',
    };

    const res = await Card.findOneAndUpdate({ name: doc.name }, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log('Upserted card id:', res._id.toString());
    const count = await mongoose.connection.db.collection('Card').countDocuments();
    console.log('Card collection count now:', count);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

upsert();
