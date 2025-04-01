const express = require('express'); // Express.js for the server
const cors = require('cors'); // Cross-Origin Resource Sharing (CORS)
const path = require('path'); // For working with paths
require('dotenv').config();

const sessionManager = require("./session/sessionManager");
const routes = require('./routes/routes');
const { existsUser } = require("./utils/userData");

const app = express();

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/src/views'));

// Middleware Configuration
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/controllers', express.static(path.join(__dirname, '../backend/controllers')));
app.use('/models', express.static(path.join(__dirname, '../backend/models')));
app.use('/css', express.static(path.join(__dirname, '../frontend/public/css')));

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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));