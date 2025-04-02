const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const calendarPath = path.join(__dirname, '../data/calendar.json');


exports.getUsers = () => {
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data);
};

exports.getUserById = (id) => {
    return exports.getUsers().find(user => user.id === id);
};

const loadCalendars = () => {
    if (!fs.existsSync(calendarPath)) return [];
    const data = fs.readFileSync(calendarPath);
    return JSON.parse(data);
};

const saveCalendars = (calendars) => {
    fs.writeFileSync(calendarPath, JSON.stringify(calendars, null, 2));
};

exports.createCalendar = (ownerId, name, sharedWith = [], color = null) => {
    const calendars = loadCalendars();
    const id = `cal-${Date.now()}`;
    const newCalendar = {
        id,
        ownerId,
        name,
        sharedWith,
        events: [],
        color
    };
    calendars.push(newCalendar);
    saveCalendars(calendars);
    return newCalendar;
};

exports.getCalendarsForUser = (userId) => {
    const calendars = loadCalendars();
    return calendars.filter(c => c.ownerId === userId);
};