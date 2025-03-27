/**
 * @file tasksModel.js
 * @class TasksModel
 * Handles data loading and operations for user tasks.
 */
export class TasksModel {
    constructor() {
        /** @type {Object} Will hold the tasks data after loading the JSON. */
        this.tasksData = {};
    }

    /**
     * Loads tasks data from the tasks.json file using fetch.
     * @returns {Promise<void>}
     */
    async loadTasks() {
        const response = await fetch('tasks.json');
        this.tasksData = await response.json();
    }

    /**
     * Returns an array of tasks for a specific user.
     * @param {string} userId The ID of the user whose tasks are needed.
     * @returns {Array} List of task objects.
     */
    getTasksByUser(userId) {
        return this.tasksData[userId] || [];
    }

    /**
     * Adds a new task for the specified user.
     * @param {string} userId The ID of the user to add the task to.
     * @param {Object} task The task object to be added.
     */
    addTask(userId, task) {
        if (!this.tasksData[userId]) {
            this.tasksData[userId] = [];
        }
        this.tasksData[userId].push(task);
        // In a real app, you would send this change to an API or server as well
    }

    /**
     * Marks the given task index as done for a specific user.
     * @param {string} userId The ID of the user.
     * @param {number} taskIndex Index of the task in the array.
     */
    markTaskDone(userId, taskIndex) {
        if (this.tasksData[userId] && this.tasksData[userId][taskIndex]) {
            this.tasksData[userId][taskIndex].done = true;
            // In a real app, persist this change on the server
        }
    }
}
