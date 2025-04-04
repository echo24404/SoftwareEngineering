/**
 * @file signupRoutes.test.js
 * Integration-like tests for signupRoutes using Supertest.
 */
const request = require("supertest");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { saveUser, existsUser } = require("../../backend/models/signupModel"); // Import the relevant model

// Mock for the fs module (simulating file system for image uploads)
jest.mock("fs");

describe("signupRoutes", () => {
    let app;

    beforeAll(() => {
        app = express();
        // Body parser
        app.use(express.urlencoded({ extended: true }));

        // Test view folder (must exist!)
        // We place a minimal "signup.ejs" here or mock the rendering.
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "test-views"));

        // Importing the signupRoutes and using them under /signup
        const signupRoutes = require("../../backend/routes/signupRoutes");
        app.use("/signup", signupRoutes);
    });

    beforeEach(() => {
        // Reset the user data before each test to ensure a clean slate
        global.users = [];
    });

    test("GET /signup => 200 and renders signup page", async () => {
        // Test if the signup page is rendered correctly
        const response = await request(app).get("/signup");
        // Check that the status is OK
        expect(response.status).toBe(200);
        // In test-views/signup.ejs we have some word "Sign Up"
        expect(response.text).toContain("Sign Up");
    });

    test("POST /signup => creates a new user and redirects to /tasks", async () => {
        const newUser = {
            username: "newUser",
            password: "newPassword123",
        };

        // Mocking the behavior of saving the user and image upload (no actual file operations)
        fs.renameSync.mockImplementation(() => {});

        const response = await request(app)
            .post("/signup")
            .send(`data=${JSON.stringify(newUser)}`);

        // We expect a redirect to /tasks after successful signup
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");

        // After the request, the user should exist in the global users array
        expect(existsUser("newUser")).toBe(true);
    });

    test("POST /signup => fails if username already exists", async () => {
        const existingUser = {
            username: "existingUser",
            password: "existingPassword123",
        };

        // First, save the existing user
        saveUser(existingUser);

        // Try to create a new user with the same username
        const response = await request(app)
            .post("/signup")
            .send(`data=${JSON.stringify(existingUser)}`);

        // We expect the response to be a redirect (302), but it should fail due to duplicate username
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/signup"); // Returning back to signup page

        // Make sure the existing user was not duplicated
        expect(global.users.length).toBe(1);
    });

    test("POST /signup => fails if username or password is empty", async () => {
        const incompleteUser = {
            username: "",
            password: "",
        };

        // Try submitting an empty username and password
        const response = await request(app)
            .post("/signup")
            .send(`data=${JSON.stringify(incompleteUser)}`);

        // Expect a redirect back to the signup page if fields are empty
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/signup");

        // Ensure no user is added
        expect(global.users.length).toBe(0);
    });

    test("POST /signup => handles file upload and assigns image path correctly", async () => {
        const userWithImage = {
            username: "userWithImage",
            password: "securePassword123",
        };

        const mockFile = { path: '/mock/path/to/image.jpg', originalname: 'image.jpg' };

        // Mock fs file handling
        fs.renameSync.mockImplementation(() => {});

        // Create a new user and simulate uploading an image
        const response = await request(app)
            .post("/signup")
            .field("data", JSON.stringify(userWithImage))
            .attach("image", mockFile.path);

        // Check the redirect to the tasks page
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");

        // Verify that the user has an image path associated
        const savedUser = global.users.find(user => user.username === "userWithImage");
        expect(savedUser.imagePath).toBe("/uploads/users/userWithImage.jpg");
    });
});
