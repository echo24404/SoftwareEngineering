const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

exports.getUsers = () => {
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data);
};

let calendars = {}; // key: userId → array of calendars

exports.createCalendar = (ownerId, name, sharedWith = []) => {
    const id = `cal-${Date.now()}`;
    const newCalendar = { id, name, ownerId, sharedWith, events: [] };

    if (!calendars[ownerId]) calendars[ownerId] = [];
    calendars[ownerId].push(newCalendar);

    return newCalendar;
};

exports.getCalendarsForUser = (userId) => {
    return calendars[userId] || [];
};

exports.getCalendarById = (calendarId, userId) => {
    const calendars = exports.getCalendarsForUser(userId);
    return calendars.find(cal => cal.id === calendarId);
};

exports.getUserById = (id) => {
    const users = exports.getUsers();
    return users.find(u => u.id === id);
};

exports.addEventToCalendar = (calendarId, userId, event) => {
    const calendar = exports.getCalendarById(calendarId, userId);
    if (!calendar) return false;
    calendar.events.push(event);
    return true;
};

exports.deleteEventFromCalendar = (calendarId, userId, date, title) => {
    const calendar = exports.getCalendarById(calendarId, userId);
    if (!calendar) return false;

    calendar.events = calendar.events.filter(event =>
        !(event.date === date && event.title === title)
    );

    return true;
};
