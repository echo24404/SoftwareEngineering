// backend/routes/index.js - Route für die Homepage

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("Homepage", { title: "Willkommen in der WG-App" });
});

module.exports = router;
