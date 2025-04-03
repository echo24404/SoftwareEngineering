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


/**
 * Erstellt eine neue Kategorie (Einkaufsliste).
 * Erwartet im Body: "categoryName".
 */
exports.createCategory = async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ error: "Kategorie Name ist erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (data[categoryName]) {
            return res.status(400).json({ error: "Kategorie existiert bereits" });
        }
        data[categoryName] = [];
        await updateShoppingLists(data);
        res.status(201).json({ message: "Kategorie erstellt", categoryName });
    } catch (error) {
        console.error("Fehler beim Erstellen der Kategorie:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Löscht eine Kategorie (Einkaufsliste).
 * Erwartet im Body: "categoryName".
 */
exports.deleteCategory = async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ error: "Kategorie Name ist erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (!data[categoryName]) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        delete data[categoryName];
        await updateShoppingLists(data);
        res.status(200).json({ message: "Kategorie gelöscht", categoryName });
    } catch (error) {
        console.error("Fehler beim Löschen der Kategorie:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
