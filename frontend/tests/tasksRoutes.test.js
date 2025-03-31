/**
 * @file tasksRoutes.test.js
 * Integrationstest-ähnlich für tasksRoutes mit Supertest.
 */
const request = require("supertest");
const express = require("express");
const path = require("path");

// tasksRoutes, das wir testen
const tasksRoutes = require("../../backend/routes/tasksRoutes");

// Mock fürs Model
jest.mock("../../backend/models/tasksModel", () => {
    // Wir legen ein einfaches Mock-Objekt an, um tasksRoutes zu testen
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
            // Wir tun so, als ob wir es speichern
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
        // Body-Parser
        app.use(express.urlencoded({ extended: true }));

        // Test-View-Ordner (muss existieren!)
        // Wir legen hier minimal eine "tasks.ejs" rein oder mocken das Rendern.
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "test-views"));

        // Routen unter /tasks
        app.use("/tasks", tasksRoutes);
    });

    test("GET /tasks => 200 und rendert tasks", async () => {
        // Ruft /tasks auf
        const response = await request(app).get("/tasks");
        // Prüfen, ob kein Fehler kam
        expect(response.status).toBe(200);
        // In test-views/tasks.ejs haben wir irgendein Wort "My Tasks" stehen
        expect(response.text).toContain("My Tasks");
    });

    test("POST /tasks/add => erzeugt neue Aufgabe, leitet um (302)", async () => {
        const response = await request(app)
            .post("/tasks/add")
            .send("title=Test+Task");
        // Wir erwarten Redirect
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });

    test("POST /tasks/add => wenn title leer, keine neue Aufgabe", async () => {
        // Leerer Title
        const response = await request(app)
            .post("/tasks/add")
            .send("title=");
        // Wieder Redirect
        expect(response.status).toBe(302);
        // Kein Fehler
    });

    test("POST /tasks/done => markiert index=0 als erledigt, redirect", async () => {
        const response = await request(app)
            .post("/tasks/done")
            .send("index=0");
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });

    test("POST /tasks/done => wenn kein Index, immer noch redirect", async () => {
        const response = await request(app)
            .post("/tasks/done")
            .send(""); // kein index
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });
});
