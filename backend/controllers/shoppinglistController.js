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
 * Gibt die Artikel einer bestimmten Kategorie zurück.
 * Erwartet einen Query-Parameter "category".
 */
exports.getItems = async (req, res) => {
    const category = req.query.category;
    if (!category) {
        return res.status(400).json({ error: "Kategorie query parameter is required" });
    }
    try {
        const data = await getShoppingLists();
        res.json(data[category] || []);
    } catch (error) {
        console.error("Fehler beim Abrufen der Artikel:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Erstellt einen neuen Artikel in einer bestimmten Kategorie.
 * Erwartet im Body: "category" und "itemName".
 * Der Artikel erhält zusätzlich den Ersteller (userId), aktuell hardcodiert auf "1",
 * und wird mit done: false initialisiert.
 * Es wird geprüft, ob der Artikel bereits existiert.
 */
exports.createItem = async (req, res) => {
    const { category, itemName } = req.body;
    if (!category || !itemName) {
        return res.status(400).json({ error: "Kategorie und Artikelname sind erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (!data[category]) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        // Duplikat-Prüfung
        const existing = data[category].find(item => item.name === itemName);
        if (existing) {
            return res.status(400).json({ error: "Artikel existiert bereits" });
        }
        // Benutzer-ID: Bei Session-Integration hier ersetzen; aktuell hardcodiert
        const userId = (req.session && req.session.user && req.session.user.id) ? req.session.user.id : "1";
        const newItem = { name: itemName, createdBy: userId, done: false };
        data[category].push(newItem);
        await updateShoppingLists(data);
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Fehler beim Erstellen des Artikels:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Löscht einen Artikel aus einer bestimmten Kategorie.
 * Erwartet im Body: "category" und "itemName".
 */
exports.deleteItem = async (req, res) => {
    const { category, itemName } = req.body;
    if (!category || !itemName) {
        return res.status(400).json({ error: "Kategorie und Artikelname sind erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (!data[category]) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        const originalLength = data[category].length;
        data[category] = data[category].filter(item => item.name !== itemName);
        if (data[category].length === originalLength) {
            return res.status(404).json({ error: "Artikel nicht gefunden" });
        }
        await updateShoppingLists(data);
        res.status(200).json({ message: "Artikel gelöscht", itemName });
    } catch (error) {
        console.error("Fehler beim Löschen des Artikels:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Aktualisiert einen Artikel (Bearbeiten).
 * Erwartet im Body: "category", "oldItemName" und "newItemName".
 */
exports.updateItem = async (req, res) => {
    const { category, oldItemName, newItemName } = req.body;
    if (!category || !oldItemName || !newItemName) {
        return res.status(400).json({ error: "Kategorie, alter und neuer Artikelname sind erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (!data[category]) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        // Prüfen, ob neuer Name bereits existiert (außer für den aktuellen Artikel)
        const duplicate = data[category].find(item => item.name === newItemName && item.name !== oldItemName);
        if (duplicate) {
            return res.status(400).json({ error: "Artikelname existiert bereits" });
        }
        const item = data[category].find(item => item.name === oldItemName);
        if (!item) {
            return res.status(404).json({ error: "Artikel nicht gefunden" });
        }
        item.name = newItemName;
        await updateShoppingLists(data);
        res.status(200).json({ message: "Artikel aktualisiert", item });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Artikels:", error);
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


/**
 * Toggle: Markiert einen Artikel als erledigt oder unerledigt.
 * Erwartet im Body: "category" und "itemName".
 */
exports.toggleItemStatus = async (req, res) => {
    const { category, itemName } = req.body;
    if (!category || !itemName) {
        return res.status(400).json({ error: "Kategorie und Artikelname sind erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (!data[category]) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        const item = data[category].find(item => item.name === itemName);
        if (!item) {
            return res.status(404).json({ error: "Artikel nicht gefunden" });
        }
        item.done = !item.done;
        await updateShoppingLists(data);
        res.status(200).json({ message: "Status aktualisiert", item });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Artikelstatus:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Aktualisiert die Reihenfolge der Artikel in einer Kategorie.
 * Erwartet im Body: "category" und "newOrder" (Array von Artikelnamen in gewünschter Reihenfolge).
 */
exports.updateOrder = async (req, res) => {
    const { category, newOrder } = req.body;
    if (!category || !Array.isArray(newOrder)) {
        return res.status(400).json({ error: "Kategorie und neues Array sind erforderlich" });
    }
    try {
        const data = await getShoppingLists();
        if (!data[category]) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        const reordered = [];
        newOrder.forEach(itemName => {
            const item = data[category].find(item => item.name === itemName);
            if (item) {
                reordered.push(item);
            }
        });
        data[category].forEach(item => {
            if (!newOrder.includes(item.name)) {
                reordered.push(item);
            }
        });
        data[category] = reordered;
        await updateShoppingLists(data);
        res.status(200).json({ message: "Reihenfolge aktualisiert", items: reordered });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Reihenfolge:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};