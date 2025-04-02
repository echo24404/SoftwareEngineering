const fs = require('fs');
const path = require('path');
const calendarModel = require('../models/calendarModel');

const testFilePath = path.join(__dirname, '../data/calendar.json');

beforeEach(() => {
    fs.writeFileSync(testFilePath, JSON.stringify([], null, 2));
});