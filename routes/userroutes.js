const User = require("../models/User");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
router.post('/createuser', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        // Check if the error is a MongoDB validation error
        if (error.name === 'ValidationError') {
            const errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        // Handle other errors
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Could not create user", error: error.message });
    }
});

router.post('/loginuser', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        console.log(process.env.JWT_SECRET);
        // Generate JWT token
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Could not login", error: error.message });
    }
});

router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate password reset token
        const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.status(200).json({ message: "Password reset token generated", resetToken });
    } catch (error) {
        res.status(500).json({ message: "Could not generate reset token", error: error.message });
    }
});
router.post('/resetpassword', async (req, res) => {
    const { email, newPassword, resetToken } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Verify the reset token
        jwt.verify(resetToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update user's password with the new hashed password
            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ message: "Password reset successful" });
        });
    } catch (error) {
        res.status(500).json({ message: "Could not reset password", error: error.message });
    }
});
module.exports = router;
