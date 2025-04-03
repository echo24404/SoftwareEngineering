const express = require('express');
const router = express.Router();
const shoppinglistController = require('../controllers/shoppinglistController');

// GET: Rendert die Einkaufslisten-Seite (EJS-Template)
router.get('/', (req, res) => {
    res.render('shoppinglist', {
        title: 'Einkaufsliste',
        tagline: 'Verwalte deine Einkaufslisten',
        currentPage: 'shoppinglist'
    });
});

// API-Endpunkte:

router.get('/categories', shoppinglistController.getCategories);
router.get('/items', shoppinglistController.getItems);
router.post('/item', shoppinglistController.createItem);
router.delete('/item', shoppinglistController.deleteItem);
router.put('/item', shoppinglistController.updateItem);
router.post('/category', shoppinglistController.createCategory);
router.delete('/category', shoppinglistController.deleteCategory);

module.exports = router;
