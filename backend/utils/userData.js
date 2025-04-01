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

/**
 * @function addRecipeToUser
 * @description Adds a recipe to the list of recipes for a specific user.
 * @param {string} username - The username of the user to add the recipe to.
 * @param {number} recipeId - The ID of the recipe to be added to the user's recipe list.
 * @returns {boolean} `true` if the recipe was successfully added, otherwise `false`.
 */
function addRecipeToUser(username, recipeId) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && !user.recipes.includes(recipeId)) {
        user.recipes.push(recipeId); // Add the recipeId to the user's recipes array
        saveUsers(users); // Save the updated list of users
        return true
    }
    return false
}

/**
 * @function removeRecipeFromUser
 * @description Removes a recipe from the list of recipes for a specific user.
 * @param {string} username - The username of the user to remove the recipe from.
 * @param {number} recipeId - The ID of the recipe to be removed from the user's recipe list.
 * @returns {boolean} `true` if the recipe was successfully removed, otherwise `false`.
 */
function removeRecipeFromUser(username, recipeId) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && user.recipes.includes(recipeId)) {
        user.recipes = user.recipes.filter(id => id !== recipeId); // Remove the recipeId from the recipes array
        saveUsers(users); // Save the updated list of users
        return true
    }
    return false
}

/**
 * @function addFavouriteToUser
 * @description Adds a recipe to the user's list of favourites.
 * @param {string} username - The username of the user to add the favorite to.
 * @param {number} recipeId - The ID of the recipe to be added to the user's favourites.
 * @returns {boolean} `true` if the recipe was successfully added to the favourites, otherwise `false`.
 */
function addFavouriteToUser(username, recipeId) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && !user.favourites.includes(recipeId)) {
        user.favourites.push(recipeId); // Add the recipeId to the user's favourites array
        saveUsers(users); // Save the updated list of users
        return true
    }
    return false
}

/**
 * @function removeFavouriteFromUser
 * @description Removes a recipe from the user's list of favourites.
 * @param {string} username - The username of the user to remove the favorite from.
 * @param {number} recipeId - The ID of the recipe to be removed from the user's favourites.
 * @returns {boolean} `true` if the recipe was successfully removed from the favourites, otherwise `false`.
 */
function removeFavouriteFromUser(username, recipeId) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && user.favourites.includes(recipeId)) {
        user.favourites = user.favourites.filter(id => id !== recipeId); // Remove the recipeId from the favourites array
        saveUsers(users); // Save the updated list of users
        return true
    }
    return false
}

/**
 * @function removeFavouriteFromAllUsers
 * @description Removes a specific recipe from the favourites list of all users.
 * @param {number} recipeId - The ID of the recipe to be removed from the favourites of all users.
 * @returns {void}
 */
function removeFavouriteFromAllUsers(recipeId) {
    const users = getUsers();
    users.forEach(user => {
        if (user.favourites.includes(recipeId)) {
            user.favourites = user.favourites.filter(id => id !== recipeId);
        }
    });
    saveUsers(users);
}

module.exports = {
    getUsers,
    getUser,
    saveUser,
    existsUser,
    addRecipeToUser,
    removeRecipeFromUser,
    addFavouriteToUser,
    removeFavouriteFromUser,
    removeFavouriteFromAllUsers
};
