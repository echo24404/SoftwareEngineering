/**
 * @file tests/tasksModel.test.js
 * Unit-Tests für das TasksModel.
 */
const fs = require("fs");
const path = require("path");
const TasksModel = require("../../backend/models/tasksModel");

// Um mögliche Nebeneffekte beim Schreiben in tasks.json zu vermeiden, mocken wir fs:
jest.mock("fs");

describe("TasksModel", () => {
    let tasksModel;
    let mockFilePath;

    beforeAll(() => {
        // Wir erzwingen, dass filePath auf eine Test-JSON zeigt
        tasksModel = new TasksModel();
        mockFilePath = path.join(__dirname, "mockTasks.json");
        tasksModel.filePath = mockFilePath;
    });

    beforeEach(() => {
        // Jest-Mocks zurücksetzen
        jest.clearAllMocks();

        // Wir simulieren einen Dateiinhalt in mockTasks.json
        fs.readFileSync.mockReturnValue(JSON.stringify({
            "1": [
                { "title": "Clean the kitchen", "done": false }
            ],
            "2": [
                { "title": "Buy groceries", "done": false }
            ]
        }));
    });

    test("should load all tasks from file", () => {
        const result = tasksModel.loadAllTasks();
        expect(result).toEqual({
            "1": [
                { "title": "Clean the kitchen", "done": false }
            ],
            "2": [
                { "title": "Buy groceries", "done": false }
            ]
        });
        // Prüfen, ob fs.readFileSync aufgerufen wurde
        expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, "utf8");
    });

    test("should return tasks for a specific user", () => {
        const user1Tasks = tasksModel.getTasksByUser("1");
        expect(user1Tasks).toEqual([{ "title": "Clean the kitchen", "done": false }]);

        const user2Tasks = tasksModel.getTasksByUser("2");
        expect(user2Tasks).toEqual([{ "title": "Buy groceries", "done": false }]);

        // Falls ein unbekannter User, sollte leeres Array zurückkommen
        const unknownUserTasks = tasksModel.getTasksByUser("999");
        expect(unknownUserTasks).toEqual([]);
    });

    test("should add a task for a user", () => {
        fs.writeFileSync.mockImplementation(() => {}); // Mock, um Fehler zu vermeiden

        tasksModel.addTask("1", { title: "Testtask", done: false });

        // Nach addTask wird fs.readFileSync und fs.writeFileSync aufgerufen
        expect(fs.readFileSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();

        // Prüfen, ob die Daten mit dem neuen Task geschrieben wurden
        const [filePath, data] = fs.writeFileSync.mock.calls[0];
        expect(filePath).toBe(mockFilePath);

        const writtenJson = JSON.parse(data);
        expect(writtenJson["1"].length).toBe(2);
        expect(writtenJson["1"][1]).toEqual({ title: "Testtask", done: false });
    });

    test("should mark a task as done", () => {
        fs.writeFileSync.mockImplementation(() => {});

        // Index 0 in user "1" soll done=true werden
        tasksModel.markTaskDone("1", 0);

        // writeFileSync wird aufgerufen
        expect(fs.writeFileSync).toHaveBeenCalled();
        const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
        expect(writtenData["1"][0].done).toBe(true);
    });
});
