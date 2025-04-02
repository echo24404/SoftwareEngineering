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

describe('calendarController', () => {
    test('showUserSelection rendert selectUsers.ejs mit Nutzern', () => {
        const req = {};
        const res = mockResponse();

        calendarController.showUserSelection(req, res);

        expect(res.render).toHaveBeenCalledWith('selectUsers', expect.objectContaining({
            users: expect.any(Array)
        }));
    });

    test('createCalendar erstellt Kalender und leitet weiter', () => {
        const req = {
            body: {
                name: 'ControllerTest',
                ownerId: 'u1',
                sharedWith: ['u2']
            }
        };
        const res = mockResponse();

        calendarController.createCalendar(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/my-calendars/u1');

        const result = calendarModel.getCalendarsForUser('u1');
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('ControllerTest');
    });

    test('showUserCalendars rendert calendarList.ejs', () => {
        const userId = 'u1';
        calendarModel.createCalendar(userId, 'Test1');
        calendarModel.createCalendar(userId, 'Test2');

        const req = { params: { userId } };
        const res = mockResponse();

        calendarController.showUserCalendars(req, res);

        expect(res.render).toHaveBeenCalledWith('calendarList', {
            userId,
            calendars: expect.any(Array)
        });
    });

    test('showCalendar rendert calendarView.ejs', () => {
        const cal = calendarModel.createCalendar('u1', 'Einzelkalender', ['u2']);
        const req = {
            params: { userId: 'u1', calendarId: cal.id },
            query: {}
        };
        const res = mockResponse();

        calendarController.showCalendar(req, res);

        expect(res.render).toHaveBeenCalledWith('calendarView', expect.objectContaining({
            calendar: expect.any(Object),
            owner: expect.any(Object),
            sharedWith: expect.any(Array),
            days: expect.any(Array)
        }));
    });

    test('addEvent fügt Termin hinzu und leitet weiter', () => {
        const cal = calendarModel.createCalendar('u1', 'Event-Kalender');
        const req = {
            params: { userId: 'u1', calendarId: cal.id },
            body: {
                date: '2025-04-10',
                title: 'Controller-Eintrag'
            }
        };
        const res = mockResponse();

        calendarController.addEvent(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/calendar/u1/${cal.id}`);

        const neu = calendarModel.getCalendarById(cal.id, 'u1');
        expect(neu.events[0].title).toBe('Controller-Eintrag');
    });

    test('deleteEvent entfernt Termin und leitet zurück', () => {
        const cal = calendarModel.createCalendar('u1', 'Löschtest');
        calendarModel.addEventToCalendar(cal.id, 'u1', { date: '2025-04-12', title: 'Lösche mich' });

        const req = {
            params: { userId: 'u1', calendarId: cal.id },
            body: { date: '2025-04-12', title: 'Lösche mich' }
        };
        const res = mockResponse();

        calendarController.deleteEvent(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/calendar/u1/${cal.id}`);

        const updated = calendarModel.getCalendarById(cal.id, 'u1');
        expect(updated.events.length).toBe(0);
    });

    test('showCalendar gibt 404 zurück wenn Kalender nicht existiert', () => {
        const req = { params: { userId: 'u404', calendarId: 'nichtda' }, query: {} };
        const res = mockResponse();

        calendarController.showCalendar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Kalender nicht gefunden');
    });

    test('addEvent gibt 404 zurück wenn Kalender nicht existiert', () => {
        const req = {
            params: { userId: 'u404', calendarId: 'falsch' },
            body: { date: '2025-01-01', title: 'Egal' }
        };
        const res = mockResponse();

        calendarController.addEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Kalender nicht gefunden');
    });


});





