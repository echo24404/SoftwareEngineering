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



});
