/**
 * @file tasksModel.js
 * Provides methods to manage tasks in tasks.json.
 */
const fs = require("fs");
const path = require("path");

class TasksModel {
    constructor() {
        // Path to data/tasks.json
        this.filePath = path.join(__dirname, "../data/tasks.json");
    }

    /**
     * Loads all tasks from the JSON file.
     * @returns {Object}
     */
    loadAllTasks() {
        try {
            const data = fs.readFileSync(this.filePath, "utf8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading tasks.json:", error);
            return {};
        }
    }

    /**
     * Writes the provided object to tasks.json.
     * @param {Object} tasksData
     */
    saveAllTasks(tasksData) {
        try {
            fs.writeFileSync(
                this.filePath,
                JSON.stringify(tasksData, null, 2),
                "utf8"
            );
        } catch (error) {
            console.error("Error writing tasks.json:", error);
        }
    }

    /**
     * Returns all tasks for a specific user.
     * @param {string} userId
     * @returns {Array}
     */
    getTasksByUser(userId) {
        const allTasks = this.loadAllTasks();
        return allTasks[userId] || [];
    }

    /**
     * Adds a new task for a specific user.
     * @param {string} userId
     * @param {Object} task
     */
    addTask(userId, task) {
        const allTasks = this.loadAllTasks();
        if (!allTasks[userId]) {
            allTasks[userId] = [];
        }
        allTasks[userId].push(task);
        this.saveAllTasks(allTasks);
    }

    /**
     * Marks a task as done.
     * @param {string} userId
     * @param {number} taskIndex
     */
    markTaskDone(userId, taskIndex) {
        const allTasks = this.loadAllTasks();
        if (allTasks[userId] && allTasks[userId][taskIndex]) {
            allTasks[userId][taskIndex].done = true;
            this.saveAllTasks(allTasks);
        }
    }
}

module.exports = TasksModel;
