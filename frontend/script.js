// Block click actions
document.querySelectorAll('.block').forEach(block => {
    block.addEventListener('click', () => {
        alert(block.textContent + " clicked!");
    });
});

// Get Started button
document.getElementById('getStarted').addEventListener('click', () => {
    window.location.href = "select.html";
});


const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const uuid = require('crypto').randomUUID();
    
    try {
        const user = await prisma.user.create({
            data: { email, password: hashed, uuid }
        });
        res.json({ message: "User created", uuid });
    } catch (err) {
        res.status(400).json({ error: "Email already exists" });
    }
});

// Add more endpoints similarly...

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
