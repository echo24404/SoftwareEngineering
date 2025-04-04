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
 * @route GET /signup
 * @description shows the registration page
 */
router.get('/', (req, res) => {
    res.render('signup');
});

/**
 * @route POST /signup
 * @description Registriert einen neuen Benutzer
 */
router.post('/', uploadUser.single("image"), (req, res) => {
    const jsonData = JSON.parse(req.body.data);
    const {username, password} = jsonData;

    if (!validateFields({username, password}, res)) return;

    if (existsUser(username)) {
        return sendError(res, "User with this name already exists.");
    }

    let imagePath = '/uploads/users/placeholder.png';

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

    const newUser = {
        username,
        password: hashPassword(password),
        imagePath,
        joinedAt: new Date().toISOString(),
    };

    saveUser(newUser);
    sessionManager.storeUsernameInSession(req, username);

    res.status(201).send({
        success: true,
        message: "User created successfully",
    });
});

module.exports = router;