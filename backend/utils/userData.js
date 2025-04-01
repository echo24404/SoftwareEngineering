const fs = require("fs");
const {join} = require("node:path");

/**
 * @function getUsers
 * @description Reads the `users.json` file, parses the JSON data, and returns the list of users.
 * @returns {Array} An array of user objects from the `users.json` file.
 */
function getUsers() {
    const usersData = fs.readFileSync(join(__dirname, './data/users.json'), 'utf-8'); // Lesen der Datei
    return JSON.parse(usersData); // Rückgabe der geparsten JSON-Daten
}

/**
 * @function getUser
 * @description Retrieves all users, and returns user with the specified username if exists.
 * @returns {Object|null}
 * - The user object if a user with the specified username is found.
 * - `null` if no user with the specified username exists.
 */
function getUser(username) {
    const users = getUsers();
    const user = users.find(user => user.username === username);
    if (user === undefined) return null;
    return user;
}

/**
 * @function saveUsers
 * @description Writes the given list of users to the `users.json` file, saving the data in JSON format.
 * @param {Array} users - An array of user objects to be saved.
 * @returns {void}
 */
function saveUsers(users) {
    fs.writeFileSync(join(__dirname, './data/users.json'), JSON.stringify(users, null, 2)); // Schreiben der Daten in die Datei
}

/**
 * @function saveUser
 * @description Adds a new user to the list of users and saves the updated list to the `users.json` file.
 * @param {Object} newUser - The new user object to be added. It should contain user-specific properties like `username`, `email`, etc.
 * @returns {void}
 */
function saveUser(newUser) {
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
}

/**
 * @function existsUser
 * @description Checks if a user with the given username exists in the system.
 * @param {string} username - The username to check for existence.
 * @returns {boolean} `true` if the user exists, otherwise `false`.
 */
function existsUser(username) {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    return user !== undefined;
}


module.exports = {
    getUsers,
    getUser,
    saveUser,
    existsUser
};
