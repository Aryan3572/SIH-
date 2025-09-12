const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

// Routes

// Submit trip data
app.post('/api/trips', async (req, res) => {
    const { trip_number, origin, destination, time, mode, consent, travellers } = req.body;

    if (!consent) {
        return res.status(400).json({ error: "User consent is required." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO trips (trip_number, origin, destination, time, mode, consent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [trip_number, origin, destination, time, mode, consent]
        );

        const tripId = result.rows[0].id;

        if (Array.isArray(travellers) && travellers.length > 0) {
            for (const traveller of travellers) {
                await pool.query(
                    `INSERT INTO travellers (trip_id, name, age, relation) VALUES ($1, $2, $3, $4)`,
                    [tripId, traveller.name, traveller.age, traveller.relation]
                );
            }
        }

        res.json({ message: "Trip saved successfully.", trip_id: tripId });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Get all trips
app.get('/api/trips', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM trips ORDER BY created_at DESC`);
        res.json({ trips: result.rows });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Get specific trip with travellers
app.get('/api/trips/:id', async (req, res) => {
    const tripId = req.params.id;

    try {
        const tripResult = await pool.query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found." });
        }

        const travellersResult = await pool.query(`SELECT * FROM travellers WHERE trip_id = $1`, [tripId]);
        res.json({
            trip: tripResult.rows[0],
            travellers: travellersResult.rows
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
