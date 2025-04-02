/**
 * @file tasksRoutes.test.js
 * Integration-like tests for tasksRoutes using Supertest.
 */
const request = require("supertest");
const express = require("express");
const path = require("path");

// tasksRoutes we want to test
const tasksRoutes = require("../../backend/routes/tasksRoutes");

// Mock for the Model
jest.mock("../../backend/models/tasksModel", () => {
    // We create a simple mock object to test tasksRoutes
    const mockData = {
        "1": [
            { "title": "Clean the kitchen", "done": false }
        ]
    };

    return class {
        loadAllTasks() {
            return mockData;
        }
        saveAllTasks(newData) {
            // We pretend to save it
            Object.assign(mockData, newData);
        }
        getTasksByUser(userId) {
            return mockData[userId] || [];
        }
        addTask(userId, task) {
            if (!mockData[userId]) {
                mockData[userId] = [];
            }
            mockData[userId].push(task);
        }
        markTaskDone(userId, index) {
            if (mockData[userId] && mockData[userId][index]) {
                mockData[userId][index].done = true;
            }
        }
    };
});

describe("tasksRoutes", () => {
    let app;

    beforeAll(() => {
        app = express();
        // Body parser
        app.use(express.urlencoded({ extended: true }));

        // Test view folder (must exist!)
        // We place a minimal "tasks.ejs" here or mock the rendering.
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "test-views"));

        // Routes under /tasks
        app.use("/tasks", tasksRoutes);
    });

    test("GET /tasks => 200 and renders tasks", async () => {
        // Calls /tasks
        const response = await request(app).get("/tasks");
        // Check that no error occurred
        expect(response.status).toBe(200);
        // In test-views/tasks.ejs we have some word "My Tasks"
        expect(response.text).toContain("My Tasks");
    });

    test("POST /tasks/add => creates new task, redirects (302)", async () => {
        const response = await request(app)
            .post("/tasks/add")
            .send("title=Test+Task");
        // We expect a redirect
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });

    test("POST /tasks/add => if title is empty, no new task", async () => {
        // Empty title
        const response = await request(app)
            .post("/tasks/add")
            .send("title=");
        // Again a redirect
        expect(response.status).toBe(302);
        // No error
    });

    test("POST /tasks/done => marks index=0 as done, redirect", async () => {
        const response = await request(app)
            .post("/tasks/done")
            .send("index=0");
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });

    test("POST /tasks/done => if no index, still redirect", async () => {
        const response = await request(app)
            .post("/tasks/done")
            .send(""); // no index
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });
});
