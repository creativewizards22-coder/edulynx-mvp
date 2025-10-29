// server.js - Complete Express and Mongoose Setup for Voting App

// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate'); // Import the Candidate model
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Database Connection (Mongoose)
// NOTE: This uses the default local connection string.
// Ensure your MongoDB server is installed and running!
const DB_URI = 'mongodb://localhost:27017/edulynx_votes_db'; 

mongoose.connect(DB_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please ensure MongoDB is installed and running.');
    process.exit(1);
  });

// 3. Middleware Setup
app.use(express.json()); // To read JSON request bodies

// 4. API Routes (Endpoints)

// A. Test Route
app.get('/', (req, res) => {
  res.status(200).send({ 
    message: "Welcome to the Edulynx Voting API! Visit /api/candidates to get started.",
    server_status: "Running",
    db_status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// B. Candidate Management Routes

// POST /api/candidates: Add a new candidate
app.post('/api/candidates', async (req, res) => {
  try {
    const { name, affiliation, platform } = req.body;
    const candidate = new Candidate({ name, affiliation, platform });
    await candidate.save();
    res.status(201).json({ 
        message: 'Candidate added successfully',
        candidate: candidate 
    });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error (for 'name' being unique)
        return res.status(400).json({ error: `Candidate with name '${req.body.name}' already exists.` });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/candidates: Get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    // Sort by voteCount descending (highest votes first)
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Start the Server
app.listen(PORT, () => {
  console.log(`----------------------------------------------------`);
  console.log(`🌍 Server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server.`);
});

