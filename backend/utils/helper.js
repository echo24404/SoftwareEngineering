const fs = require('fs');
/**
 * @function sendError
 * @description Sends a standardized error response to the client.
 *
 * @param {Object} res - The Express response object used to send the error response.
 * @param {string} message - The error message to include in the response.
 * @param {number} [statusCode=400] - The HTTP status code for the response. Defaults to 400 if not specified.
 *
 * @example
 * // Sending a 404 error
 * sendError(res, 'Resource not found', 404);
 *
 * @example
 * // Sending a 400 error (default)
 * sendError(res, 'Invalid input');
 *
 * @returns {void} Does not return a value; sends a response directly.
 */
const sendError = (res, message, statusCode = 400) => {
    res.status(statusCode).send({success: false, message});
};

/**
 * @function validateFields
 * @description Validates that all required fields are present and non-empty. If any fields are missing, an error response is sent.
 *
 * @param {Object} fields - An object containing the fields to validate, where the keys are field names and the values are their corresponding values.
 * @param {Object} res - The Express response object used to send an error response if validation fails.
 *
 * @example
 * const fields = { name: "John", email: "" };
 * const isValid = validateFields(fields, res);
 * // Sends an error response: "Missing required fields: email"
 *
 * @returns {boolean} Returns `true` if all fields are valid; otherwise, `false`.
 */
const validateFields = (fields, res) => {
    const missingFields = Object.keys(fields).filter((key) => fields[key] === undefined);
    if (missingFields.length > 0) {
        sendError(res, `Missing required fields: ${missingFields.join(", ")}`);
        return false;
    }
    return true;
};

/**
 * @function validateRecipeOwnership
 * @description Validates whether the given user is the owner of the specified recipe. If not, an error response is sent.
 *
 * @param {Object} recipe - The recipe object containing ownership details.
 * @param {string} username - The username of the user attempting to perform an action on the recipe.
 * @param {Object} res - The Express response object used to send an error response if ownership validation fails.
 *
 * @example
 * const recipe = { id: 1, author: "john_doe" };
 * const isOwner = validateRecipeOwnership(recipe, "jane_doe", res);
 * // Sends an error response: "You do not have permission to perform this action on this recipe."
 *
 * @returns {boolean} Returns `true` if the user is the owner of the recipe; otherwise, `false`.
 */
function validateRecipeOwnership(recipe, username, res) {
    if (recipe.author !== username) {
        sendError(res, "You do not have permission to perform this action on this recipe.", 403);
        return false;
    }
    return true;
}

/**
 * @function removeImageFile
 * @description Removes an image file from the specified path. Sends an error response if the removal fails.
 *
 * @param {string} imagePath - The file system path to the image that needs to be removed.
 * @param {Object} res - The Express response object used to send an error response if file removal fails.
 *
 * @example
 * const imagePath = "/path/to/image.jpg";
 * const isRemoved = removeImageFile(imagePath, res);
 * // If successful, the file is deleted; otherwise, an error response is sent.
 *
 * @returns {boolean} Returns `true` if the file is successfully removed or doesn't exist; otherwise, `false` if an error occurs.
 */
function removeImageFile(imagePath, res) {
    try {
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete the image file
        }
    } catch (err) {
        sendError(res, "Error removing the image file.", 500);
        return false;
    }
    return true;
}

module.exports = {
    sendError,
    validateFields,
    validateRecipeOwnership,
    removeImageFile,
};