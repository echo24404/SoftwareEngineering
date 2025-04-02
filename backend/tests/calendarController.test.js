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




