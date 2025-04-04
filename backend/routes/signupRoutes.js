const express = require('express');
const {saveUser, existsUser} = require("../utils/userData");
const {hashPassword} = require("../utils/encryption");
const sessionManager = require('../session/sessionManager');
const {uploadUser} = require('../utils/multerConfig');
const {sendError, validateFields} = require("../utils/helper");
const path = require("path");
const fs = require("fs");
const router = express.Router();

/**
 * @route POST /api/register
 * @description Handles user registration by creating a new user account with a unique username.
 * @param {Object} req - The request object containing `username` and `password` in the body.
 * @param {Object} res - The response object.
 * @returns {Object} Returns a success message upon successful registration or an error message if the username already exists or input validation fails.
 */
router.post('/', uploadUser.single("image"), (req, res) => {
    const jsonData = JSON.parse(req.body.data);
    const {username, password} = jsonData;

    // Validate input: both username and password are required
    if (!validateFields({username, password}, res)) return;

    // Check if the username already exists
    if (existsUser(username)) {
        return sendError(res, "User with this name already exists.");
    }

    let imagePath = '/uploads/users/placeholder.png';

    // Handle file renaming if an image was uploaded
    if (req.file) {
        const newFilename = `${username}${path.extname(req.file.originalname)}`;
        const newFilePath = path.join(__dirname, '../uploads/users', newFilename);

        try {
            fs.renameSync(req.file.path, newFilePath);
            imagePath = `/uploads/users/${newFilename}`;
        } catch (err) {
            return sendError(res, "Error processing the uploaded image.", 500);
        }
    }

    // Create a new user object
    const newUser = {
        username,
        password: hashPassword(password), // Hash the password before storing it
        recipes: [], // Initialize with no recipes
        favourites: [], // Initialize with no favourites
        imagePath,
        joinedAt: new Date().toISOString(),
    };

    // Add the new user and save the updated list to storage
    saveUser(newUser);

    sessionManager.storeUsernameInSession(req, username);

    // Respond with a success message
    res.status(201).send({
        success: true,
        message: "User created successfully",
    });
});


module.exports = router;