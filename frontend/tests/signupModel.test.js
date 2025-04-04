const { saveUser, existsUser } = require('../../backend/models/signupModel');
const fs = require("fs");
const path = require("path");


jest.mock("fs");

describe("SignupModel", () => {
    let mockFilePath;

    beforeAll(() => {
        mockFilePath = path.join(__dirname, "mockUsers.json");
        fs.readFileSync.mockImplementation(() => JSON.stringify([])); // Initialisiert als leere Liste
    });

    beforeEach(() => {
        global.users = [];
        saveUser.mockClear();
        existsUser.mockClear();
    });

    test('should save a new user', () => {
        const newUser = { username: 'testUser', password: 'securePass123' };

        saveUser(newUser); // Aufruf der Funktion zum Speichern des Benutzers
        expect(existsUser('testUser')).toBe(true);
    });

    test('should return false for non-existing users', () => {
        expect(existsUser('nonExistingUser')).toBe(false);
    });

    test('should not allow duplicate users', () => {
        const newUser = { username: 'duplicateUser', password: 'pass123' };
        saveUser(newUser);

        expect(existsUser('duplicateUser')).toBe(true);

        saveUser(newUser);

        expect(global.users.filter(user => user.username === 'duplicateUser').length).toBe(1);
    });

    test('should handle saving user with an image', () => {
        const mockFile = { path: '/mock/path/to/image.jpg', originalname: 'image.jpg' };
        const newUserWithImage = { username: 'userWithImage', password: 'password123', image: mockFile };

        saveUser(newUserWithImage); // Speichert den Benutzer

        expect(existsUser('userWithImage')).toBe(true);

        expect(global.users[0].imagePath).toBe('/uploads/users/userWithImage.jpg');
    });
});
