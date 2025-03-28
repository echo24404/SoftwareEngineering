/**
 * @file tasksRoutes.js
 * Routes for displaying and modifying tasks.
 */
const express = require("express");
const router = express.Router();

const TasksModel = require("../models/tasksModel");
const tasksModel = new TasksModel();

// Beispiel: Hardcodierter User
const USER_ID = "1";

// GET /tasks → Zeigt alle Tasks des Users "1" an
router.get("/", (req, res) => {
    const userTasks = tasksModel.getTasksByUser(USER_ID);
    res.render("tasks", {
        title: "My Tasks",
        tasks: userTasks,
    });
});

/**
 * POST /tasks/add
 * Fügt eine neue Aufgabe hinzu, sofern 'title' nicht leer ist.
 */
router.post("/add", (req, res) => {
    console.log("req.body beim add:", req.body);
    const { title } = req.body;

    // Wenn title vorhanden ist & nicht nur Leerzeichen
    if (title && title.trim() !== "") {
        tasksModel.addTask(USER_ID, { title, done: false });
    }
    res.redirect("/tasks");
});

/**
 * POST /tasks/done
 * Markiert eine Aufgabe als erledigt
 */
router.post("/done", (req, res) => {
    console.log("req.body beim done:", req.body);
    const { index } = req.body;

    // Nur wenn index wirklich existiert
    if (index !== undefined) {
        tasksModel.markTaskDone(USER_ID, parseInt(index));
    }
    res.redirect("/tasks");
});

module.exports = router;
