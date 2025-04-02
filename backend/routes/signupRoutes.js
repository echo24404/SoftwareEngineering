const express = require('express');
const { saveUser, existsUser } = require("../utils/userData");
const { hashPassword } = require("../utils/encryption");
const sessionManager = require('../session/sessionManager');
const { uploadUser } = require('../utils/multerConfig');
const { sendError, validateFields } = require("../utils/helper");
const path = require("path");
const fs = require("fs");
const router = express.Router();



// POST /api/register → Handles user registration and creation
router.post('/', uploadUser.single("image"), async (req, res) => {
    const jsonData = JSON.parse(req.body.data);
    const { username, password } = jsonData;

    // Validate input: both username and password are required
    if (!validateFields({ username, password }, res)) return;

    // Check if the username already exists
    if (existsUser(username)) {
        return sendError(res, "User with this name already exists.");
    }

    let imagePath = '../uploads/users/placeholder.png';

    // Handle file renaming if an image was uploaded
    if (req.file) {
        const newFilename = `${username}${path.extname(req.file.originalname)}`;
        const newFilePath = path.join(__dirname, '../uploads/users', newFilename);

        try {
            fs.renameSync(req.file.path, newFilePath);
            imagePath = `../uploads/users/${newFilename}`;
        } catch (err) {
            return sendError(res, "Error processing the uploaded image.", 500);
        }
    }

    // Create a new user object
    const newUser = {
        username,
        password: hashPassword(password), // Hash the password before storing it
        wg: [], // Initialize with no wg
        imagePath,
        joinedAt: new Date().toISOString(),
    };

    try {
        // Add the new user and save the updated list to storage
        await saveUser(newUser);  // Assuming saveUser() handles asynchronous behavior correctly

        // Store the username in the session
        sessionManager.storeUsernameInSession(req, username);

        // Respond with a success message
        res.status(201).send({
            success: true,
            message: "User created successfully",
        });
    } catch (err) {
        // If saving the user failed
        return sendError(res, "Error while saving the user data.", 500);
    }
});

// GET /api/register → Displays the registration form (if needed, this could be a simple view render)
router.get('/', (req, res) => {
    res.render("register", { title: "Register User" });
});

module.exports = router;
