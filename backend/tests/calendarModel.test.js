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

    test('addEventToCalendar fügt Termin hinzu', () => {
        const cal = calendarModel.createCalendar('u1', 'Mit Termin');
        const event = { date: '2025-04-02', title: 'Testtermin' };

        const added = calendarModel.addEventToCalendar(cal.id, 'u1', event);
        expect(added).toBe(true);

        const neu = calendarModel.getCalendarById(cal.id, 'u1');
        expect(neu.events.length).toBe(1);
        expect(neu.events[0].title).toBe('Testtermin');
    });