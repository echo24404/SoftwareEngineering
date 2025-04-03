const fs = require('fs').promises;
const path = require('path');
const { getShoppingLists, updateShoppingLists } = require('../models/shoppinglistModel');

/**
 * Gibt alle Kategorien (Einkaufslisten) zurück.
 */
exports.getCategories = async (req, res) => {
    try {
        const data = await getShoppingLists();
        const categories = Object.keys(data);
        res.json(categories);
    } catch (error) {
        console.error("Fehler beim Abrufen der Kategorien:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Weitere Funktionen (getItems, createItem, etc.) bleiben vorerst unverändert.
