// --- Routes ---
const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/signupController');

const upload = multer({ dest: 'uploads/' });

router.get('/signup', userController.showSignupForm);
router.post('/signup', upload.single('image'), userController.registerUser);

module.exports = router;