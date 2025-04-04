const express = require('express');
const { getLoginPage, handleLogin } = require('../controllers/loginController');
const router = express.Router();

/**
 * @route GET /login
 * @description Displays the login page to the user.
 */
router.get('/', getLoginPage);

/**
 * @route POST /login
 * @description Handles the login request by verifying the user's credentials.
 */
router.post('/', handleLogin);

module.exports = router;
