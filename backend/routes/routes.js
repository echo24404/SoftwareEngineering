const express = require('express');

const registerRoutes = require('./register.routes');
const authRoutes = require('./auth.routes');

const router = express.Router();


// Prefix routes with /api

router.use('/auth', authRoutes);
router.use('/register', registerRoutes);
module.exports = router;
