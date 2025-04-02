const calendarController = require('../controllers/calendarController');
const calendarModel = require('../models/calendarModel');

// Mock-req und -res Objekte
const mockResponse = () => {
    const res = {};
    res.render = jest.fn();
    res.redirect = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    return res;
};

const fs = require('fs');
const path = require('path');
const testCalendarPath = path.join(__dirname, '../data/calendar.json');

beforeEach(() => {
    fs.writeFileSync(testCalendarPath, JSON.stringify([], null, 2));
});
