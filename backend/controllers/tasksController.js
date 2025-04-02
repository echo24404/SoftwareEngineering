/**
 * @file tasksController.js
 * @class TasksController
 * Manages the interaction between the TasksModel and the HTML(EJS) view.
 */

import { TasksModel } from '../models/tasksModel.js';

export class TasksController {
    /**
     * @constructor
     * @param {string} userId The ID of the currently logged-in user.
     */
    constructor(userId) {
        this.userId = userId;
        this.model = new TasksModel();
    }

    /**
     * Initializes the controller by:
     * 1) Loading tasks data
     * 2) Rendering tasks for the current user
     * 3) Setting up event listeners
     */
    async init() {
        await this.model.loadTasks();
        this.renderTasks();
        this.setupEventListeners();
    }

    /**
     * Renders the tasks in the DOM for the current user.
     */
    renderTasks() {
        const tasks = this.model.getTasksByUser(this.userId);
        const taskList = document.getElementById('task-list');

        // Clear the list before rendering
        taskList.innerHTML = '';

        // Populate the list
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.title} - ${task.done ? 'Done' : 'Not done'}`;

            // Only show a "Mark as done" button if it's not done yet
            if (!task.done) {
                const doneBtn = document.createElement('button');
                doneBtn.textContent = 'Mark as done';
                doneBtn.addEventListener('click', () => {
                    this.model.markTaskDone(this.userId, index);
                    this.renderTasks();
                });
                li.appendChild(doneBtn);
            }

            taskList.appendChild(li);
        });
    }

    /**
     * Sets up event listeners (e.g., for adding new tasks).
     */
    setupEventListeners() {
        const addTaskBtn = document.getElementById('add-task-btn');

        addTaskBtn.addEventListener('click', () => {
            const title = prompt('Enter the task title:');
            if (title) {
                this.model.addTask(this.userId, { title, done: false });
                this.renderTasks();
            }
        });
    }
}
