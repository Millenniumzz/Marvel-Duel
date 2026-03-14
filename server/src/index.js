require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const cardRoutes = require('./routes/cards');
const deckRoutes = require('./routes/decks');
const metaDeckRoutes = require('./routes/metaDecks');
const adminRoutes = require('./routes/admin');
const imageRoutes = require('./routes/images');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/meta-decks', metaDeckRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Marvel Duel API is running' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
