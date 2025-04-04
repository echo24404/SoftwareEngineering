const fs = require('fs');
const path = require('path');

// Path to the JSON file where users are stored
const USERS_FILE_PATH = path.join(__dirname, '..', 'data', 'users.json');

/**
 * @description Reads the users from the JSON file.
 * @returns {Array} List of users.
 */
const readUsers = () => {
    if (fs.existsSync(USERS_FILE_PATH)) {
        const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

/**
 * @description Authenticates a user by checking the username and password.
 * @param {string} username - The user's entered username.
 * @param {string} password - The user's entered password.
 * @returns {Object|null} Returns the user object if authenticated, otherwise null.
 */
const authenticateUser = (username, password) => {
    const users = readUsers();
    return users.find(user => user.username === username && user.password === password) || null;
};

module.exports = { authenticateUser };
