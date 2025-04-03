const express = require('express');
const router = express.Router();
const shoppinglistController = require('../controllers/shoppinglistController');

// Render the basic shopping list page
router.get('/', (req, res) => {
    res.render('shoppinglist', {
        title: 'Einkaufsliste',
        tagline: 'Einkaufsliste'
    });
});

module.exports = router;
