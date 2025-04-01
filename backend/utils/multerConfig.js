const multer = require('multer');
const path = require('path');

const allowedFileTypes = /jpeg|jpg|png/;

/**
 * @function fileFilter
 * @description Middleware function to filter uploaded files based on their type.
 * It checks the file extension and MIME type to ensure only valid image files are accepted.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} file - The file object representing the uploaded file.
 * @param {Function} cb - A callback function used to signal acceptance or rejection of the file.
 *
 * @example
 * const multer = require('multer');
 * const upload = multer({ fileFilter });
 *
 * app.post('/upload', upload.single('image'), (req, res) => {
 *     res.send('File uploaded successfully');
 * });
 *
 * @throws {Error} If the uploaded file type is not allowed.
 * @returns {void} The function doesn't return a value; it signals the result using the callback.
 */
const fileFilter = (req, file, cb) => {
    if (!file) {
        cb(null, true); // No file provided; proceed without error
    } else {
        const isValidType = allowedFileTypes.test(path.extname(file.originalname).toLowerCase()) && allowedFileTypes.test(file.mimetype);
        isValidType ? cb(null, true) : cb(new Error('Only images (JPEG, JPG, PNG) are allowed.'));
    }
};

/**
 * @constant
 * @type {Object}
 * @description Multer storage configuration for handling user file uploads.
 * Specifies the destination and filename for storing uploaded files related to users.
 *
 * @property {Function} destination - Function to determine the destination directory for uploaded user files.
 * @property {Function} filename - Function to set a temporary filename for the uploaded files.
 * Files are renamed later in the workflow.
 *
 * @example
 * const multer = require('multer');
 * const upload = multer({ storage: userStorage });
 *
 * app.post('/upload', upload.single('userFile'), (req, res) => {
 *     res.send('User file uploaded successfully');
 * });
 */
const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/users'));
    },
    filename: (req, file, cb) => {
        cb(null, 'temp'); // Placeholder, renamed later
    },
});

// Exported Multer Instances
module.exports = {
    uploadUser: multer({
        storage: userStorage,
        fileFilter,
        limits: {fileSize: 5 * 1024 * 1024}, // Max file size: 5MB
    }),
};
