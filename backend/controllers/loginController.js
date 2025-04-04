const { authenticateUser } = require('../models/loginModel');
const router = require('express').Router();

/**
 * @route GET /login
 * @description Renders the login page for the user.
 */
const getLoginPage = (req, res) => {
    res.render('login');  // Renders the login view
};

/**
 * @route POST /login
 * @description Handles the login process by validating user credentials.
 * @param {string} username - The username entered by the user.
 * @param {string} password - The password entered by the user.
 */
const handleLogin = (req, res) => {
    const { username, password } = req.body;

    // Validate the user's input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Authenticate the user
    const user = authenticateUser(username, password);

    if (!user) {
        return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Successful login
    res.status(200).json({ message: 'Login successful!' });
};

// Export the methods for use in the routes
module.exports = { getLoginPage, handleLogin };
