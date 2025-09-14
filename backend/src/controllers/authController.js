const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const prisma = new PrismaClient();
const { randomUUID } = require('crypto');

const signup = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    try {
        const hashed = await hashPassword(password);
        const uuid = randomUUID();
        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
                uuid
            }
        });
        const token = generateToken(uuid);
        res.json({ message: "User signed up successfully", token });
    } catch (error) {
        res.status(400).json({ error: "Email already exists or invalid data." });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const token = generateToken(user.uuid);
        res.json({ message: "Logged in successfully", token });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
};

module.exports = { signup, login };
