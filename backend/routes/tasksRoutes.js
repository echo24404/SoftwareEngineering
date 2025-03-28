const express = require("express");
const router = express.Router();

/**
 * @route GET /tasks
 * @desc Renders the tasks page
 */
router.get("/", (req, res) => {
    res.render("tasks", {
        title: "My Tasks" // Beispiel für eine Variable, die du in tasks.ejs verwenden kannst
    });
});

module.exports = router;
