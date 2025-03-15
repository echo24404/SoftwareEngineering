// backend/routes/index.js - Route für die Homepage

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", { title: "Willkommen in der WG-App" });
});

module.exports = router;
