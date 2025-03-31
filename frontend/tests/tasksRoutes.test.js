/**
 * @file tests/tasksRoutes.test.js
 * Integrationstest-ähnlich für tasksRoutes mit Supertest.
 */
const request = require("supertest");
const express = require("express");
const path = require("path");

// Wir nutzen unser tasksRoutes-Modul
const tasksRoutes = require("../../backend/routes/tasksRoutes");

// Da tasksRoutes das Model nutzt, mocken wir es hier teils oder nutzen ein echtes Tempfile
jest.mock("../../backend/models/tasksModel", () => {
    const mockData = {
        "1": [
            { "title": "Clean the kitchen", "done": false }
        ]
    };

    // Einfacher Mock für das Model
    return class {
        loadAllTasks() {
            return mockData;
        }
        saveAllTasks(newData) {
            // Hier könnte man testweise die Änderungen in mockData ablegen
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
        // Eine kleine Express-App, die nur unsere tasksRoutes benutzt
        app = express();
        app.use(express.urlencoded({ extended: true }));

        // Wir simulieren den EJS-Render-Prozess:
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "test-views"));
        // test-views Ordner anlegen oder mocken
        // Oder wir mocken res.render unten, um EJS zu umgehen

        app.use("/tasks", tasksRoutes);
    });

    test("GET /tasks => 200 und ruft render für tasks auf", async () => {
        const response = await request(app).get("/tasks");
        expect(response.status).toBe(200);
        // Wir erwarten im Body z. B. irgendwas, was im Template stünde
        expect(response.text).toContain("My Tasks");
    });

    test("POST /tasks/add => erzeugt neue Aufgabe und leitet um", async () => {
        const response = await request(app)
            .post("/tasks/add")
            .send("title=Test+Task");  // simuliere ein form-urlencoded-Feld
        // Nach dem POST sollte ein 302 (Redirect) kommen
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });

    test("POST /tasks/done => markiert eine Aufgabe als erledigt und leitet um", async () => {
        const response = await request(app)
            .post("/tasks/done")
            .send("index=0");
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/tasks");
    });
});
