const express = require('express');
const { getSignupPage, handleSignup } = require('../controllers/signupController');
const router = express.Router();

/**
 * @route GET /signup
 * @description Displays the signup page to the user.
 */
router.get('/', getSignupPage);

/**
 * @route POST /signup
 * @description Registers a new user by handling the POST request.
 */
router.post('/', handleSignup);

module.exports = router;
