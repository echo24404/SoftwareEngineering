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
 * @description Saves a new user to the JSON file.
 * @param {Object} user - The user object containing username and password.
 */
const saveUser = (user) => {
    const users = readUsers();
    users.push(user);  // Add the new user to the list
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2)); // Save users back to the file
};

/**
 * @description Checks if a user already exists in the system.
 * @param {string} username - The username to check for existence.
 * @returns {boolean} Returns true if the user exists, otherwise false.
 */
const existsUser = (username) => {
    const users = readUsers();
    return users.some(user => user.username === username);  // Check if the username already exists
};

module.exports = { saveUser, existsUser };
