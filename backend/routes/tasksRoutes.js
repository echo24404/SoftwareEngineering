/**
 * @file tasksRoutes.js
 * Routes for displaying and modifying tasks.
 */
const express = require("express");
const router = express.Router();

const TasksModel = require("../models/tasksModel");
const tasksModel = new TasksModel();

// Example: Hardcoded user
const USER_ID = "1";

// GET /tasks → Displays all tasks for user "1"
router.get("/", (req, res) => {
    const userTasks = tasksModel.getTasksByUser(USER_ID);
    res.render("tasks", {
        title: "My Tasks",
        tasks: userTasks,
    });
});

/**
 * POST /tasks/add
 * Adds a new task, provided 'title' is not empty.
 */
router.post("/add", (req, res) => {
    console.log("req.body on add:", req.body);
    const { title } = req.body;

    // Only add if title exists & is not just whitespace
    if (title && title.trim() !== "") {
        tasksModel.addTask(USER_ID, { title, done: false });
    }
    res.redirect("/tasks");
});

/**
 * POST /tasks/done
 * Marks a task as done
 */
router.post("/done", (req, res) => {
    console.log("req.body on done:", req.body);
    const { index } = req.body;

    // Only if index actually exists
    if (index !== undefined) {
        tasksModel.markTaskDone(USER_ID, parseInt(index));
    }
    res.redirect("/tasks");
});

module.exports = router;
