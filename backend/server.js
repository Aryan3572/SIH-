// src/index.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/trips', async (req, res) => {
    const { tripNumber, origin, destination, time, mode, accompanying, userConsent } = req.body;

    if (!userConsent) {
        return res.status(400).json({ error: "User consent required." });
    }

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
            }
        });
        res.json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save trip." });
    }
});

app.get('/trips', async (req, res) => {
    const trips = await prisma.trip.findMany();
    res.json(trips);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Login Route
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
