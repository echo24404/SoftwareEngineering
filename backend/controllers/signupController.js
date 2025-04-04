const { saveUser, existsUser } = require('../models/signupModel');
const router = require('express').Router();

/**
 * @route GET /signup
 * @description Renders the signup page to the user.
 */
const getSignupPage = (req, res) => {
    res.render('signup'); // Renders the signup view
};

/**
 * @route POST /signup
 * @description Handles user registration by validating and saving new user data.
 * @param {string} username - The user's chosen username.
 * @param {string} password - The user's chosen password.
 */
const handleSignup = (req, res) => {
    const { username, password } = req.body;

    // Validate user input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if the user already exists
    if (existsUser(username)) {
        return res.status(400).json({ error: 'User already exists.' });
    }

    const newUser = { username, password }; // In a real app, passwords should be hashed!
    saveUser(newUser); // Save the new user data

    res.status(201).json({ message: 'User successfully created.' });
};

// Export the methods to be used in the routes
module.exports = { getSignupPage, handleSignup };
