const express = require('express'); // Express.js for the server
const cors = require('cors'); // Cross-Origin Resource Sharing (CORS)
const path = require('path'); // For working with paths
require('dotenv').config();

const sessionManager = require("./session/sessionManager");
const routes = require('./routes/routes');
const {existsUser} = require("./utils/userData");

const app = express();

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/src/views'));

// Middleware Configuration
app.use(cors());

// Serve static files from the public directory
app.use('/controllers', express.static(path.join(__dirname, '../backend/controllers')));
app.use('/models', express.static(path.join(__dirname, '../backend/models')));
app.use('/css', express.static(path.join(__dirname, '../frontend/public/css')));

app.use(express.json());

// Configure session middleware
sessionManager.configureSession(app);

// Use the routes defined in the routes.js file
app.use('/api', routes);

// Serve the uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes for different views
app.get('/', (req, res) => {
    const username = req.session?.username;
    if (username && existsUser(username)) {
        return res.redirect('/index'); // Redirect to the user dashboard if logged in
    }
    return res.status(200).render('index', { title: "Home Page" });
});

app.get('/signup', (req, res) => {
    return res.status(200).render('signup', { title: "Sign Up" });
});

app.get('/login', (req, res) => {
    return res.status(200).render('login', { title: "Login" });
});

/**
 * @function jsonErrorHandlerMiddleware
 * @description Custom error handler middleware to catch and handle malformed JSON errors.
 * Checks if the error is an instance of `SyntaxError`, which typically occurs when the JSON in the request body is invalid.
 * If the error is a `SyntaxError`, responds with a 400 status and a custom error message indicating invalid JSON.
 * If the error is not a `SyntaxError`, passes it to the next middleware for further handling.
 * @param {Object} err - The error object containing details about the error.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The callback function to pass control to the next middleware or error handler.
 * @returns {void}
 */
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {  // This checks for a SyntaxError, which occurs with malformed JSON
        console.error("Malformed JSON:", err.message);
        return res.status(400).send({success: false, message: "Invalid JSON format. Please check your request body."});
    }
    next();  // If it's not a SyntaxError, pass it along to the next middleware
});

/**
 * @function 404ErrorMiddleware
 * @description Middleware to handle 404 errors by responding with a custom "Page Not Found" page.
 * If the request results in a 404 error, the user is redirected to a `pageNotFound.html` page.
 * If the error is not 404, it is passed to the next error handler.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The callback function to pass control to the next middleware or error handler.
 * @returns {void}
 */
app.use((req, res, next) => {
    const err = new Error('Requested Page Not Found. Please try again.');
    err.status = 404;
    if (err.status === 404) {
        console.error(`Error status ${err.status}, ${err.message}`);
        res.status(404).render('pageNotFound', {
            message: 'Die von dir aufgerufene Seite existiert nicht.',
        });
    } else {
        next(err);
    }
});

/**
 * @function errorHandlerMiddleware
 * @description Global error-handling middleware to catch and handle errors that occur during request processing.
 * Sets the response status based on the error status or defaults to 500 (Internal Server Error).
 * If the error does not have a message, a default error message is assigned.
 * Responds with a custom error page (`error.html`) for the user.
 * @param {Object} err - The error object containing details about the error.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The callback function to pass control to the next middleware or error handler.
 * @returns {void}
 */
app.use((err, req, res, next) => {
    const error = err;
    if (!err.message) {
        error.message = 'Internal Server Error. Please try again later.';
    } else {
        error.message = err.message;
    }
    res.status(err.status || 500).render('error', {message: error.message});
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
    console.log(`Call DEV-Frontend: http://localhost:${PORT}`);
});