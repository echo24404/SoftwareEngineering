const fs = require('fs');
const path = require('path');
const calendarModel = require('../models/calendarModel');

const testFilePath = path.join(__dirname, '../data/calendar.json');

beforeEach(() => {
    fs.writeFileSync(testFilePath, JSON.stringify([], null, 2));
});

describe('calendarModel', () => {
    test('createCalendar erstellt neuen Kalender', () => {
        const cal = calendarModel.createCalendar('u1', 'Testkalender', ['u2']);
        expect(cal.name).toBe('Testkalender');

        const alle = calendarModel.getCalendarsForUser('u1');
        expect(alle.length).toBe(1);
        expect(alle[0].name).toBe('Testkalender');
    });