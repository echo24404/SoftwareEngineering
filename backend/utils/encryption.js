const {getUsers} = require("./userData");

const bcrypt = require("bcrypt");
const saltRounds = 10;

/**
 * Hashes a password using bcrypt.
 * This function securely hashes a password with a salt factor, ensuring safe storage.
 *
 * @param {string} password - The password to be hashed.
 * @returns {string} The resulting bcrypt hash of the password.
 */
function hashPassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}

/**
 * Checks if a user exists in the JSON file and if the hashed password matches.
 *
 * @param {string} username - The username to check.
 * @param {string} password - The password to check by hashing and comparing.
 * @returns {boolean} Returns true if the user exists and the password matches, false otherwise.
 */
function verifyUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user) {
        return bcrypt.compareSync(password, user.password);
    }

    return false;
}

module.exports = {
    hashPassword,
    verifyUser
}