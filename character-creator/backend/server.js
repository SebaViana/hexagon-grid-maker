const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost'  // Adjust if needed
}));

// Setup PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define uploads directory
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});
const upload = multer({ storage });

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// Create characters table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    race VARCHAR(50),
    character_class VARCHAR(50),
    strength INTEGER,
    dexterity INTEGER,
    intelligence INTEGER,
    luck INTEGER,
    health INTEGER,
    image VARCHAR
  );
`, (err) => {
  if (err) {
    console.error('Error creating table', err);
  }
});

// Endpoint to save character data (CREATE)
app.post('/api/personajes', upload.single('image'), async (req, res) => {
  console.log('Request Body:', req.body);  // Debug log
  console.log('Uploaded File:', req.file);  // Debug log

  const {
    name,
    race,
    character_class,
    strength,
    dexterity,
    intelligence,
    luck,
    health
  } = req.body;
  const image = req.file ? req.file.filename : null; // Save filename

  try {
    await pool.query(`
      INSERT INTO characters (name, race, character_class, strength, dexterity, intelligence, luck, health, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [name, race, character_class, strength, dexterity, intelligence, luck, health, image]);

    res.status(201).json({ message: 'Character created successfully' });
  } catch (err) {
    console.error('Error saving character', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get a character by ID
app.get('/api/personajes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM characters WHERE id = $1', [id]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Character not found' });
    }
  } catch (err) {
    console.error('Error fetching character', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to update character data (UPDATE)
app.put('/api/personajes/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    race,
    character_class,
    strength,
    dexterity,
    intelligence,
    luck,
    health
  } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    // Update the character with the given ID
    const result = await pool.query(`
      UPDATE characters
      SET name = $1, race = $2, character_class = $3, strength = $4, dexterity = $5,
          intelligence = $6, luck = $7, health = $8, image = COALESCE($9, image)
      WHERE id = $10
    `, [name, race, character_class, strength, dexterity, intelligence, luck, health, image, id]);

    if (result.rowCount === 0) {
      // If no character with the given ID exists
      res.status(404).json({ message: 'Character not found' });
    } else {
      res.status(200).json({ message: 'Character updated successfully' });
    }
  } catch (err) {
    console.error('Error updating character', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to list all characters (READ)
app.get('/api/personajes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error retrieving characters', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a character by ID
app.delete('/api/personajes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM characters WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Character not found' });
    } else {
      res.status(200).json({ message: 'Character deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting character', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

