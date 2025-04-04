/**
 * @file sendSignupData.test.js
 * Unit tests for the sendSignupData function.
 */
const sendSignupData = require("../models/signupModel");

// Mock the global fetch function
global.fetch = jest.fn();
global.window.location.href = "";

// Mock FormData to simulate appending data
class MockFormData {
    constructor() {
        this.data = [];
    }

    append(name, value) {
        this.data.push({ name, value });
    }
}

global.FormData = MockFormData;

describe("sendSignupData", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mock calls before each test
    });

    test("should send user data and redirect on success", async () => {
        // Arrange
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({}),
        };
        fetch.mockResolvedValue(mockResponse);

        const signupData = {
            username: "testuser",
            password: "StrongPass123!",
            image: new Blob(),
        };

        // Act
        await sendSignupData(signupData);

        // Assert
        expect(fetch).toHaveBeenCalledWith("/api/tasks/", expect.objectContaining({
            method: "POST",
            body: expect.any(MockFormData),
        }));
        expect(window.location.href).toBe('/');
    });

    test("should show alert if username exists or data is invalid", async () => {
        // Arrange
        const mockResponse = {
            ok: false,
            json: jest.fn().mockResolvedValue({}),
        };
        fetch.mockResolvedValue(mockResponse);

        const signupData = {
            username: "testuser",
            password: "StrongPass123!",
            image: new Blob(),
        };

        // Mock the showAlert function
        const showAlertMock = jest.fn();
        global.showAlert = showAlertMock;

        // Act
        await sendSignupData(signupData);

        // Assert
        expect(showAlertMock).toHaveBeenCalledWith("Der Benutzer konnte nicht angelegt werden. Der Benutzername existiert bereits oder die Daten konnten nicht verarbeitet werden.");
    });

    test("should handle null signupData gracefully", async () => {
        // Act
        await sendSignupData(null);

        // Assert
        expect(fetch).not.toHaveBeenCalled();
        expect(window.location.href).toBe(""); // Location shouldn't have changed
    });

    test("should handle fetch error and log it", async () => {
        // Arrange
        const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
        fetch.mockRejectedValue(new Error("Network Error"));

        const signupData = {
            username: "testuser",
            password: "StrongPass123!",
            image: new Blob(),
        };

        // Act
        await sendSignupData(signupData);

        // Assert
        expect(consoleErrorMock).toHaveBeenCalledWith("Error by sending the data:", new Error("Network Error"));
        consoleErrorMock.mockRestore(); // Restore original console.error
    });

    test("should not submit if password is not strong", async () => {
        // Arrange
        const weakPasswordData = {
            username: "testuser",
            password: "123",
            image: new Blob(),
        };

        const showAlertMock = jest.fn();
        global.showAlert = showAlertMock;

        // Act
        await sendSignupData(weakPasswordData);

        expect(showAlertMock).toHaveBeenCalledWith('Das eingegebene Passwort entspricht nicht den Sicherheitsanforderungen!');
        expect(fetch).not.toHaveBeenCalled(); // Should not have called fetch due to weak password
    });
    test('should send user data and redirect on success', async () => {
        const signupData = { username: 'testUser', password: 'password123', image: 'fakeImage' };

        await sendSignupData(signupData);

        expect(window.location.href).toBe('/');
    });

});
