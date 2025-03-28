const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    // Beispiel: Hardcodierte tasks
    // In Realität: tasks aus Model laden
    const tasks = [
        { title: "Clean Kitchen", done: false },
        { title: "Vacuum", done: true },
    ];

    res.render("tasks", { title: "My Tasks", tasks });
});

router.post("/add", (req, res) => {
    console.log("req.body beim add:", req.body);
    const { title } = req.body;
    // tasksModel.addTask(...);
    res.redirect("/tasks");
});

router.post("/done", (req, res) => {
    console.log("req.body beim done:", req.body);
    const { index } = req.body;
    // tasksModel.markTaskDone(...);
    res.redirect("/tasks");
});

module.exports = router;
