const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

// Setup PostgreSQL connection pool
const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'character_db',
  password: 'password',
  port: 5432,
});

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create characters table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    race VARCHAR(50),
    class VARCHAR(50),
    strength INTEGER,
    dexterity INTEGER,
    intelligence INTEGER,
    luck INTEGER,
    health INTEGER,
    image BYTEA
  );
`, (err) => {
  if (err) {
    console.error('Error creating table', err);
  }
});

// Endpoint to save character data
app.post('/characters', upload.single('image'), async (req, res) => {
  const {
    name,
    race,
    class: characterClass,
    strength,
    dexterity,
    intelligence,
    luck,
    health
  } = req.body;
  const image = req.file ? req.file.buffer : null;

  try {
    await pool.query(`
      INSERT INTO characters (name, race, class, strength, dexterity, intelligence, luck, health, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [name, race, characterClass, strength, dexterity, intelligence, luck, health, image]);

    res.status(201).json({ message: 'Character created successfully' });
  } catch (err) {
    console.error('Error saving character', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

