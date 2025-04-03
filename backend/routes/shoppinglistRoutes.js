const express = require('express');
const router = express.Router();
const shoppinglistController = require('../controllers/shoppinglistController');

// Rendert die Basis-Seite (EJS‑Template)
router.get('/', (req, res) => {
    res.render('shoppinglist', {
        title: 'Einkaufsliste',
        tagline: 'Einkaufsliste'
    });
});

// API-Endpunkt für Kategorien
router.get('/categories', shoppinglistController.getCategories);

// Weitere API-Endpunkte (für Items, etc.) werden später ergänzt.
module.exports = router;
