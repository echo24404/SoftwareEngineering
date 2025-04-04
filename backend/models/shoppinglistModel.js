const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../data/shoppinglist.json');

/**
 * Liest die Einkaufslisten aus der JSON-Datei und gibt sie als Objekt zurück.
 *
 * @async
 * @function getShoppingLists
 * @returns {Promise<Object>} Ein Objekt, das die Einkaufslisten enthält.
 */
async function getShoppingLists() {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Fehler beim Laden der Einkaufslisten:", error);
        return {};
    }
}

/**
 * Schreibt das gegebene Objekt in die JSON-Datei.
 *
 * @async
 * @function updateShoppingLists
 * @param {Object} data - Das Einkaufslisten-Objekt, das geschrieben werden soll.
 * @returns {Promise<void>} Ein Promise, das aufgelöst wird, wenn der Schreibvorgang abgeschlossen ist.
 */
async function updateShoppingLists(data) {
    try {
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Einkaufslisten:", error);
        throw error;
    }
}

module.exports = { getShoppingLists, updateShoppingLists };
