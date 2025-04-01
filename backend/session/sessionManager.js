const session = require('express-session');
const { existsUser, getUsers, getUser } = require("../utils/userData");

/**
 * @function configureSession
 * @description Configures the session middleware for the Express application with secure cookie settings.
 * @param {Object} app - The Express application to configure with session middleware.
 * @returns {void}
 */
function configureSession(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET || "In case secret is not available", // Secret key for session encryption
        resave: false, // Session is not saved on every request
        saveUninitialized: false, // Do not save new uninitialized sessions
        cookie: {
            secure: false, // secure: true if using HTTPS (e.g., in production)
            httpOnly: true,  // Make cookie inaccessible to JavaScript
            sameSite: 'Strict',  // Prevent cross-site request forgery
            // maxAge: 3600000, // Optional: 1 hour for session cookie expiration
        }
    }));
}

/**
 * @function storeUsernameInSession
 * @description Stores the username in the session for the current user.
 * @param {Object} req - The HTTP request object.
 * @param {string} username - The username to be stored in the session.
 * @returns {void}
 */
function storeUsernameInSession(req, username) {
    req.session.username = username; // Store the username in the session
}

/**
 * @function getUsernameFromSession
 * @description Retrieves the username from the session for the current user.
 * @param {Object} req - The HTTP request object.
 * @returns {string|null} - The username stored in the session, or null if no username is found.
 */
function getUsernameFromSession(req) {
    return req.session.username || null; // Return the username from session if available
}

/**
 * @function clearSession
 * @description Destroys the session.
 * @param {Object} req - The HTTP request object.
 * @returns {void}
 */
function clearSession(req) {
    req.session.destroy();
}

/**
 * @function isAuthenticated
 * @description Checks if the user is authenticated by verifying if a username exists in the session.
 * @param {Object} req - The HTTP request object.
 * @returns {boolean} - Returns `true` if the user is authenticated (username exists in session), otherwise `false`.
 */
function isAuthenticated(req) {
    if (!req || !req.session) {
        return false; // No request or session present
    }

    const username = req.session.username;
    return typeof username === 'string' && existsUser(username);
}

/**
 * @function authenticateRequest
 * @description Middleware to authenticate a request. Verifies if the user is authenticated and adds the username to the request object if valid.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function to be called.
 * @throws Will send a 401 response if the user is not authenticated.
 */
function authenticateRequest(req, res, next) {
    if (!isAuthenticated(req)) {
        return res.status(401).send({ success: false, message: "User is not authenticated." });
    }
    next();
}


module.exports = {
    configureSession,
    storeUsernameInSession,
    getUsernameFromSession,
    clearSession,
    isAuthenticated,
    authenticateRequest
};