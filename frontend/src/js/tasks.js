/**
 * @file tasks.js
 * Initializes the tasks page for a specific user.
 */

import { TasksController } from '../../../backend/controllers/tasksController.js';

// This runs once the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Example: Hardcoded user ID. In a real scenario, you might detect this from login info.
    const userId = '1';

    const tasksController = new TasksController(userId);
    await tasksController.init();
});
