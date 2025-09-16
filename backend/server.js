// server.js

import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Parser } from 'json2csv';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ----------------------
// Authentication Routes
// ----------------------

// Signup
app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUuid = uuidv4();

        const user = await prisma.user.create({
            data: { uuid: newUuid, email, password: hashedPassword }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ user: { id: user.id, uuid: user.uuid, email: user.email }, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error." });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ user: { id: user.id, uuid: user.uuid, email: user.email }, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error." });
    }
});

// ----------------------
// Auth middleware
// ----------------------

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ----------------------
// Profile
// ----------------------

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, uuid: true, email: true }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch profile." });
    }
});

// ----------------------
// Trips
// ----------------------

// Create Trip
app.post('/trips', authenticateToken, async (req, res) => {
    const { tripNumber, origin, destination, time, mode, accompanying, userConsent } = req.body;

    if (!tripNumber || !origin || !destination || !time || !mode)
        return res.status(400).json({ error: "All fields except accompanying are required." });
    if (!userConsent) return res.status(400).json({ error: "User consent is required." });

    try {
        const trip = await prisma.trip.create({
            data: {
                tripNumber,
                origin,
                destination,
                time: new Date(time),
                mode,
                accompanying,
                userConsent,
                userId: req.user.userId
            }
        });
        res.status(201).json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save trip." });
    }
});

// Get all user trips
app.get('/trips', authenticateToken, async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({ where: { userId: req.user.userId } });
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch trips." });
    }
});

// Filter trips
app.get('/trips/filter', authenticateToken, async (req, res) => {
    const { date, mode, origin, destination } = req.query;
    const filters = { userId: req.user.userId };

    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        filters.time = { gte: start, lte: end };
    }
    if (mode) filters.mode = mode;
    if (origin) filters.origin = origin;
    if (destination) filters.destination = destination;

    try {
        const trips = await prisma.trip.findMany({ where: filters });
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to filter trips." });
    }
});

// ----------------------
// Daily Trip Chains
// ----------------------

// Create chain
app.post('/dailyTripChains', authenticateToken, async (req, res) => {
    const { date, trips } = req.body;
    if (!date || !trips || !Array.isArray(trips))
        return res.status(400).json({ error: "Date and trips array are required." });

    try {
        const chain = await prisma.dailyTripChain.create({
            data: {
                userId: req.user.userId,
                date: new Date(date),
                trips: JSON.stringify(trips)
            }
        });
        res.status(201).json(chain);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save daily trip chain." });
    }
});

// Get chains
app.get('/dailyTripChains', authenticateToken, async (req, res) => {
    try {
        const chains = await prisma.dailyTripChain.findMany({
            where: { userId: req.user.userId },
            orderBy: { date: 'desc' }
        });
        res.json(chains);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch daily trip chains." });
    }
});

// ----------------------
// Analytics / Export
// ----------------------

// Trips per user
app.get('/analytics/trips-per-user', authenticateToken, async (req, res) => {
    try {
        const tripsCount = await prisma.trip.groupBy({
            by: ['userId'],
            _count: { id: true }
        });
        res.json(tripsCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get analytics." });
    }
});

// Trips per day
app.get('/analytics/trips-per-day', authenticateToken, async (req, res) => {
    try {
        const trips = await prisma.trip.groupBy({
            by: ['time'],
            _count: { id: true }
        });
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get trips per day." });
    }
});

// Export trips as CSV
app.get('/export/trips', authenticateToken, async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({ where: { userId: req.user.userId } });
        const parser = new Parser();
        const csv = parser.parse(trips);
        res.header('Content-Type', 'text/csv');
        res.attachment('trips.csv');
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to export trips." });
    }
});

// ----------------------
// Start server
// ----------------------

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
