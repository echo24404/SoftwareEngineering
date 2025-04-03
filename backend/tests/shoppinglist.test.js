// shoppinglist.test.js

const request = require('supertest');
const express = require('express');

// Wir mocken das Model, sodass wir kontrollierte Testdaten erhalten.
jest.mock('../models/shoppinglistModel', () => {
    let data = {
        "TestCategory": [
            { name: "Item1", createdBy: "1", done: false }
        ]
    };
    return {
        getShoppingLists: jest.fn(() => Promise.resolve(data)),
        updateShoppingLists: jest.fn((newData) => {
            data = newData;
            return Promise.resolve();
        })
    };
});

const shoppinglistRoutes = require('../routes/shoppinglistRoutes');

// Erstelle eine Express-App für die Tests
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routen mounten – unter /shoppinglist
app.use('/shoppinglist', shoppinglistRoutes);

describe('Shopping List API', () => {
    // Test: GET /shoppinglist/categories returns categories
    test('GET /shoppinglist/categories returns categories', async () => {
        const res = await request(app).get('/shoppinglist/categories');
        expect(res.statusCode).toBe(200);
        // Da unser Mock initial "TestCategory" enthält
        expect(res.body).toContain("TestCategory");
    });

    // Test: GET /shoppinglist/items returns items for a valid category
    test('GET /shoppinglist/items returns items for a valid category', async () => {
        const res = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ name: "Item1", createdBy: "1", done: false });
    });

    // Test: GET /shoppinglist/items returns error for invalid category
    test('GET /shoppinglist/items returns error for missing category parameter', async () => {
        const res = await request(app).get('/shoppinglist/items');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie query parameter is required");
    });

    // Test: POST /shoppinglist/category creates a new category
    test('POST /shoppinglist/category creates a new category', async () => {
        const newCategory = "NewCategory";
        const res = await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: newCategory });
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ message: "Kategorie erstellt", categoryName: newCategory });
        // Nach Erstellung sollte das Array der Kategorien den neuen Eintrag enthalten
        const catRes = await request(app).get('/shoppinglist/categories');
        expect(catRes.body).toContain(newCategory);
    });

    // Test: POST /shoppinglist/category fails if category exists
    test('POST /shoppinglist/category fails if category already exists', async () => {
        const res = await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: "TestCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie existiert bereits");
    });

    // Test: DELETE /shoppinglist/category deletes an existing category
    test('DELETE /shoppinglist/category deletes an existing category', async () => {
        // Zuerst eine Kategorie anlegen, falls noch nicht vorhanden
        const categoryToDelete = "DeleteCategory";
        await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: categoryToDelete });
        // Nun löschen
        const res = await request(app)
            .delete('/shoppinglist/category')
            .send({ categoryName: categoryToDelete });
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ message: "Kategorie gelöscht", categoryName: categoryToDelete });
        // Prüfe, ob die Kategorie nicht mehr vorhanden ist
        const catRes = await request(app).get('/shoppinglist/categories');
        expect(catRes.body).not.toContain(categoryToDelete);
    });

    // Test: POST /shoppinglist/item creates a new item in a category
    test('POST /shoppinglist/item creates a new item in a category', async () => {
        const newItem = "NewItem";
        const res = await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ name: newItem, createdBy: "1", done: false });
        // Prüfe, ob das Item in der Kategorie vorhanden ist
        const itemsRes = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(itemsRes.body).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: newItem })])
        );
    });

    // Test: POST /shoppinglist/item fails if item already exists
    test('POST /shoppinglist/item fails if item already exists', async () => {
        const res = await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "Item1" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Artikel existiert bereits");
    });

    // Test: POST /shoppinglist/toggle toggles item status
    test('POST /shoppinglist/toggle toggles item status', async () => {
        // Toggle den Status des bereits existierenden Items "Item1"
        const res = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory", itemName: "Item1" });
        expect(res.statusCode).toBe(200);
        expect(res.body.item.done).toBe(true);
        // Noch einmal toggeln
        const res2 = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory", itemName: "Item1" });
        expect(res2.body.item.done).toBe(false);
    });

    // Test: PUT /shoppinglist/item updates an item name
    test('PUT /shoppinglist/item updates an item name', async () => {
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: "Item1", newItemName: "UpdatedItem1" });
        expect(res.statusCode).toBe(200);
        expect(res.body.item).toMatchObject({ name: "UpdatedItem1" });
        // Prüfe, ob das Item mit dem neuen Namen in der Kategorie existiert
        const itemsRes = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(itemsRes.body).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: "UpdatedItem1" })])
        );
    });

    // Test: PUT /shoppinglist/item fails when new item name already exists
    test('PUT /shoppinglist/item fails when new item name already exists', async () => {
        // Zuerst ein neues Item anlegen
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "UniqueItem" });
        // Versuch, "UniqueItem" in "UpdatedItem1" zu ändern, wobei "UpdatedItem1" bereits existiert
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: "UniqueItem", newItemName: "UpdatedItem1" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Artikelname existiert bereits");
    });

    // Test: PUT /shoppinglist/order updates order
    test('PUT /shoppinglist/order updates order', async () => {
        // Füge noch ein weiteres Item hinzu, damit die Reihenfolge sich ändern kann
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "AnotherItem" });
        // Definiere eine neue Reihenfolge
        const newOrder = ["AnotherItem", "UpdatedItem1"];
        const res = await request(app)
            .put('/shoppinglist/order')
            .send({ category: "TestCategory", newOrder });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        // Überprüfe, ob die Reihenfolge dem neuen Order entspricht
        expect(res.body.items[0].name).toBe("AnotherItem");
        expect(res.body.items[1].name).toBe("UpdatedItem1");
    });
});
