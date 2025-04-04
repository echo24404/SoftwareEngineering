// shoppinglist.test.js

const request = require('supertest');
const express = require('express');

// Wir mocken das Model, sodass wir kontrollierte Testdaten erhalten.
// In einigen Tests werden wir das Mockverhalten überschreiben, um Fehlerfälle zu simulieren.
jest.mock('../models/shoppinglistModel', () => {
    let data = {
        "TestCategory": [
            { name: "Item1", createdBy: "1", done: false }
        ],
        "Discounter": [
            { name: "TK Pizza", createdBy: "1", done: false },
            { name: "Brot aus Backtheke", createdBy: "1", done: false }
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

const { getShoppingLists, updateShoppingLists } = require('../models/shoppinglistModel');
const shoppinglistRoutes = require('../routes/shoppinglistRoutes');

// Erstelle eine Express-App für die Tests
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/shoppinglist', shoppinglistRoutes);

describe('Shopping List API - Comprehensive Coverage', () => {

    /*** Tests für getCategories ***/
    test('GET /shoppinglist/categories returns categories (success)', async () => {
        const res = await request(app).get('/shoppinglist/categories');
        expect(res.statusCode).toBe(200);
        expect(res.body).toContain("TestCategory");
        expect(res.body).toContain("Discounter");
    });

    test('GET /shoppinglist/categories returns 500 on error', async () => {
        // Simuliere einen Fehler in getShoppingLists
        getShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test error")));
        const res = await request(app).get('/shoppinglist/categories');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für getItems ***/
    test('GET /shoppinglist/items returns items for a valid category', async () => {
        const res = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ name: "Item1", createdBy: "1", done: false });
    });

    test('GET /shoppinglist/items returns error for missing category parameter', async () => {
        const res = await request(app).get('/shoppinglist/items');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie query parameter is required");
    });

    test('GET /shoppinglist/items returns 500 on error', async () => {
        getShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test error")));
        const res = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für createItem ***/
    test('POST /shoppinglist/item creates a new item in a category', async () => {
        const newItem = "NewItem";
        const res = await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ name: newItem, createdBy: "1", done: false });
        const itemsRes = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(itemsRes.body).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: newItem })])
        );
    });

    test('POST /shoppinglist/item fails if missing category or itemName', async () => {
        let res = await request(app).post('/shoppinglist/item').send({ itemName: "NoCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie und Artikelname sind erforderlich");

        res = await request(app).post('/shoppinglist/item').send({ category: "TestCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie und Artikelname sind erforderlich");
    });

    test('POST /shoppinglist/item fails if category not found', async () => {
        const res = await request(app)
            .post('/shoppinglist/item')
            .send({ category: "NonExistingCategory", itemName: "ItemX" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Kategorie nicht gefunden");
    });

    test('POST /shoppinglist/item fails if item already exists', async () => {
        const res = await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "Item1" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Artikel existiert bereits");
    });

    test('POST /shoppinglist/item returns 500 on update error', async () => {
        const newItem = "ErrorItem";
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const res = await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für deleteItem ***/
    test('DELETE /shoppinglist/item deletes an existing item', async () => {
        // Erstelle ein Item zum Löschen
        const newItem = "ItemToDelete";
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        const res = await request(app)
            .delete('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Artikel gelöscht");
        const itemsRes = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(itemsRes.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ name: newItem })]));
    });

    test('DELETE /shoppinglist/item fails if missing parameters', async () => {
        const res = await request(app)
            .delete('/shoppinglist/item')
            .send({ category: "TestCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie und Artikelname sind erforderlich");
    });

    test('DELETE /shoppinglist/item fails if category not found', async () => {
        const res = await request(app)
            .delete('/shoppinglist/item')
            .send({ category: "NonExistingCategory", itemName: "Item1" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Kategorie nicht gefunden");
    });

    test('DELETE /shoppinglist/item fails if item not found', async () => {
        const res = await request(app)
            .delete('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "NonExistingItem" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Artikel nicht gefunden");
    });

    test('DELETE /shoppinglist/item returns 500 on update error', async () => {
        const newItem = "ErrorItemDelete";
        // Erstelle ein Item, das gelöscht werden soll
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const res = await request(app)
            .delete('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für toggleItemStatus ***/
    test('POST /shoppinglist/toggle toggles item status', async () => {
        // Toggle für "Item1" in TestCategory
        let res = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory", itemName: "Item1" });
        expect(res.statusCode).toBe(200);
        expect(res.body.item.done).toBe(true);

        res = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory", itemName: "Item1" });
        expect(res.body.item.done).toBe(false);
    });

    test('POST /shoppinglist/toggle fails if missing parameters', async () => {
        const res = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie und Artikelname sind erforderlich");
    });

    test('POST /shoppinglist/toggle returns 404 if item not found', async () => {
        const res = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory", itemName: "NonExistingToggle" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Artikel nicht gefunden");
    });

    test('POST /shoppinglist/toggle returns 500 on update error', async () => {
        const newItem = "ErrorToggle";
        // Erstelle das Item zunächst
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: newItem });
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const res = await request(app)
            .post('/shoppinglist/toggle')
            .send({ category: "TestCategory", itemName: newItem });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für updateItem ***/
    test('PUT /shoppinglist/item updates an item name', async () => {
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: "Item1", newItemName: "UpdatedItem1" });
        expect(res.statusCode).toBe(200);
        expect(res.body.item).toMatchObject({ name: "UpdatedItem1" });
        const itemsRes = await request(app).get('/shoppinglist/items?category=TestCategory');
        expect(itemsRes.body).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: "UpdatedItem1" })])
        );
    });

    test('PUT /shoppinglist/item fails if missing parameters', async () => {
        let res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: "Item1" });
        expect(res.statusCode).toBe(400);
        res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", newItemName: "NewName" });
        expect(res.statusCode).toBe(400);
    });

    test('PUT /shoppinglist/item fails if new item name already exists', async () => {
        // Lege zuerst ein neues Item an
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "UniqueItem" });
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: "UniqueItem", newItemName: "UpdatedItem1" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Artikelname existiert bereits");
    });

    test('PUT /shoppinglist/item fails if category not found', async () => {
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "NonExistingCategory", oldItemName: "Item1", newItemName: "AnyName" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Kategorie nicht gefunden");
    });

    test('PUT /shoppinglist/item returns 404 if item not found', async () => {
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: "NonExistingItem", newItemName: "NewName" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Artikel nicht gefunden");
    });

    test('PUT /shoppinglist/item returns 500 on update error', async () => {
        // Erstelle ein temporäres Item
        const tempItem = "TempItemForUpdate";
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: tempItem });
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const res = await request(app)
            .put('/shoppinglist/item')
            .send({ category: "TestCategory", oldItemName: tempItem, newItemName: "ErrorUpdatedItem" });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für updateOrder ***/
    test('PUT /shoppinglist/order updates order', async () => {
        // Füge noch ein weiteres Item hinzu
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "AnotherItem" });
        const newOrder = ["AnotherItem", "UpdatedItem1"];
        const res = await request(app)
            .put('/shoppinglist/order')
            .send({ category: "TestCategory", newOrder });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items[0].name).toBe("AnotherItem");
        expect(res.body.items[1].name).toBe("UpdatedItem1");
    });

    test('PUT /shoppinglist/order fails if newOrder is missing', async () => {
        const res = await request(app)
            .put('/shoppinglist/order')
            .send({ category: "TestCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie und neues Array sind erforderlich");
    });

    test('PUT /shoppinglist/order fails if category not found', async () => {
        const res = await request(app)
            .put('/shoppinglist/order')
            .send({ category: "NonExistingCategory", newOrder: ["Item1"] });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Kategorie nicht gefunden");
    });

    test('PUT /shoppinglist/order returns 500 on update error', async () => {
        // Stelle sicher, dass es mindestens ein Item gibt
        await request(app)
            .post('/shoppinglist/item')
            .send({ category: "TestCategory", itemName: "OrderErrorItem" });
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const newOrder = ["OrderErrorItem"];
        const res = await request(app)
            .put('/shoppinglist/order')
            .send({ category: "TestCategory", newOrder });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für createCategory ***/
    test('POST /shoppinglist/category creates a new category', async () => {
        const newCategory = "NewCategory";
        const res = await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: newCategory });
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ message: "Kategorie erstellt", categoryName: newCategory });
        const catRes = await request(app).get('/shoppinglist/categories');
        expect(catRes.body).toContain(newCategory);
    });

    test('POST /shoppinglist/category fails if category already exists', async () => {
        const res = await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: "TestCategory" });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie existiert bereits");
    });

    test('POST /shoppinglist/category fails if categoryName is missing', async () => {
        const res = await request(app)
            .post('/shoppinglist/category')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie Name ist erforderlich");
    });

    test('POST /shoppinglist/category returns 500 on update error', async () => {
        const newCategory = "ErrorCategory";
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const res = await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: newCategory });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    /*** Tests für deleteCategory ***/
    test('DELETE /shoppinglist/category deletes an existing category', async () => {
        const categoryToDelete = "DeleteCategory";
        await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: categoryToDelete });
        const res = await request(app)
            .delete('/shoppinglist/category')
            .send({ categoryName: categoryToDelete });
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ message: "Kategorie gelöscht", categoryName: categoryToDelete });
        const catRes = await request(app).get('/shoppinglist/categories');
        expect(catRes.body).not.toContain(categoryToDelete);
    });

    test('DELETE /shoppinglist/category fails if categoryName is missing', async () => {
        const res = await request(app)
            .delete('/shoppinglist/category')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Kategorie Name ist erforderlich");
    });

    test('DELETE /shoppinglist/category fails if category not found', async () => {
        const res = await request(app)
            .delete('/shoppinglist/category')
            .send({ categoryName: "NonExistingCategory" });
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Kategorie nicht gefunden");
    });

    test('DELETE /shoppinglist/category returns 500 on update error', async () => {
        const categoryToDelete = "ErrorDeleteCategory";
        // Zuerst Kategorie anlegen
        await request(app)
            .post('/shoppinglist/category')
            .send({ categoryName: categoryToDelete });
        updateShoppingLists.mockImplementationOnce(() => Promise.reject(new Error("Test update error")));
        const res = await request(app)
            .delete('/shoppinglist/category')
            .send({ categoryName: categoryToDelete });
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

    test('GET /shoppinglist/categories returns 500 when getShoppingLists fails', async () => {
        // Überschreibe getShoppingLists, damit sie einen Fehler wirft
        const { getShoppingLists } = require('../models/shoppinglistModel');
        getShoppingLists.mockImplementationOnce(() => Promise.reject(new Error('Test error')));

        const res = await request(app).get('/shoppinglist/categories');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Internal Server Error");
    });

});
