/**
 * @file tasksModel.js
 * Provides methods to manage tasks in tasks.json.
 */
const fs = require("fs");
const path = require("path");

class TasksModel {
    constructor() {
        // Pfad zur tasks.json
        this.filePath = path.join(__dirname, "../data/tasks.json");
    }

    /**
     * Lädt alle Tasks aus der JSON-Datei.
     * @returns {Object} tasksData
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
     * Schreibt das übergebene Object in die tasks.json.
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
     * Gibt alle Tasks für einen bestimmten User zurück.
     * @param {string} userId
     * @returns {Array} Array der Task-Objekte
     */
    getTasksByUser(userId) {
        const allTasks = this.loadAllTasks();
        return allTasks[userId] || [];
    }

    /**
     * Fügt einen neuen Task für einen bestimmten User hinzu.
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
     * Markiert eine Aufgabe als done.
     * @param {string} userId
     * @param {number} taskIndex Index der Aufgabe im Array
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
