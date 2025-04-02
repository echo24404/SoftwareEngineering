const express = require('express');
const {verifyUser} = require("../utils/encryption");
const sessionManager = require('../session/sessionManager');
const {sendError, validateFields} = require("../utils/helper");
const router = express.Router();


/**
 * @route POST /api/auth/login
 * @description Authenticates a user with the provided username and password.
 * @param {Object} req - The request object containing `username` and `password` in the body.
 * @param {Object} res - The response object.
 * @returns {Object} Returns a success message and stores the username in the session if authentication succeeds.
 */
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    // Validate the presence of username and password
    if (!validateFields({username, password}, res)) return;

    // Verify user credentials
    if (verifyUser(username, password)) {
        // Store the username in the session upon successful login
        sessionManager.storeUsernameInSession(req, username);
        res.status(200).send({
            success: true,
            message: "User logged in successfully",
        });
    } else {
        res.status(400).send({
            success: false,
            message: "Invalid username or password",
        });
    }
});

/**
 * @route GET /api/auth/check-auth
 * @description Checks if the user is authenticated based on the session data.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} Returns the authentication status and, if authenticated, the username.
 */
router.get('/check-auth', (req, res) => {
    if (sessionManager.isAuthenticated(req)) {
        res.status(200).send({
            success: true,
            message: 'User is authenticated',
            username: sessionManager.getUsernameFromSession(req),
        });
    } else {
        sendError(res, "User is not authenticated", 401);
    }
});

/**
 * @route POST /api/auth/logout
 * @description Logs out the user by clearing their session data.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} Returns a success message indicating the user has been logged out.
 */
router.post('/logout', sessionManager.authenticateRequest, (req, res) => {
    // Clear the session data
    sessionManager.clearSession(req);

    // Send success response
    res.status(200).send({
        success: true,
        message: 'User logged out successfully'
    });
});

module.exports = router;