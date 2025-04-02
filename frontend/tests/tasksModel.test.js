/**
 * @file tasksModel.test.js
 * Unit tests for the TasksModel.
 */
const fs = require("fs");
const path = require("path");
const TasksModel = require("../../backend/models/tasksModel");

// To prevent file system access, we mock fs:
jest.mock("fs");

describe("TasksModel", () => {
    let tasksModel;
    let mockFilePath;

    beforeAll(() => {
        tasksModel = new TasksModel();
        // We redirect filePath to a test file
        mockFilePath = path.join(__dirname, "mockTasks.json");
        tasksModel.filePath = mockFilePath;
    });

    beforeEach(() => {
        // Before each test: clear all mocks
        jest.clearAllMocks();
        // By default, we simulate valid JSON data
        fs.readFileSync.mockReturnValue(JSON.stringify({
            "1": [
                { "title": "Clean the kitchen", "done": false }
            ],
            "2": [
                { "title": "Buy groceries", "done": false }
            ]
        }));
    });

    test("loadAllTasks() - should load valid JSON", () => {
        const result = tasksModel.loadAllTasks();
        expect(result).toEqual({
            "1": [{ title: "Clean the kitchen", done: false }],
            "2": [{ title: "Buy groceries", done: false }]
        });
        expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, "utf8");
    });

    test("loadAllTasks() - should return {} on JSON parse error", () => {
        fs.readFileSync.mockImplementation(() => {
            throw new Error("File error");
        });
        const result = tasksModel.loadAllTasks();
        expect(result).toEqual({});
    });

    test("getTasksByUser() - should return tasks for existing user", () => {
        const user1Tasks = tasksModel.getTasksByUser("1");
        expect(user1Tasks).toEqual([{ title: "Clean the kitchen", done: false }]);
    });

    test("getTasksByUser() - should return [] for non-existing user", () => {
        const unknown = tasksModel.getTasksByUser("999");
        expect(unknown).toEqual([]);
    });

    test("addTask() - adds a task and writes to file", () => {
        fs.writeFileSync.mockImplementation(() => {}); // no error
        tasksModel.addTask("1", { title: "Test Task", done: false });

        // Check if it was written
        expect(fs.writeFileSync).toHaveBeenCalled();

        // What was written?
        const [writtenPath, content] = fs.writeFileSync.mock.calls[0];
        expect(writtenPath).toBe(mockFilePath);

        const parsedContent = JSON.parse(content);
        expect(parsedContent["1"]).toHaveLength(2);
        expect(parsedContent["1"][1]).toEqual({ title: "Test Task", done: false });
    });

    test("addTask() - should handle new user key", () => {
        fs.writeFileSync.mockImplementation(() => {});
        tasksModel.addTask("3", { title: "New user", done: false });

        expect(fs.writeFileSync).toHaveBeenCalled();
        const parsedContent = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
        expect(parsedContent["3"]).toEqual([{ title: "New user", done: false }]);
    });

    test("markTaskDone() - sets done=true for valid index", () => {
        fs.writeFileSync.mockImplementation(() => {});
        tasksModel.markTaskDone("1", 0);

        expect(fs.writeFileSync).toHaveBeenCalled();
        const parsed = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
        expect(parsed["1"][0].done).toBe(true);
    });

    test("markTaskDone() - does nothing if index is invalid", () => {
        fs.writeFileSync.mockImplementation(() => {});
        tasksModel.markTaskDone("1", 999);

        // It was written, but the data remain unchanged
        expect(fs.writeFileSync).toHaveBeenCalled();
        const parsed = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
        expect(parsed["1"][0].done).toBe(false); // was false
    });
});
