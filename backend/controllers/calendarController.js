const calendarModel = require('../models/calendarModel');

exports.showUserSelection = (req, res) => {
    const users = calendarModel.getUsers();
    res.render('selectUsers', { users });
};

exports.createCalendar = (req, res) => {
    const { name, ownerId } = req.body;
    let sharedWith = req.body.sharedWith || [];

    if (!Array.isArray(sharedWith)) {
        sharedWith = [sharedWith]; // falls nur 1 Checkbox angeklickt wurde
    }

    calendarModel.createCalendar(ownerId, name, sharedWith);
    res.redirect(`/my-calendars/${ownerId}`);
};

exports.showUserCalendars = (req, res) => {
    const userId = req.params.userId;
    const calendars = calendarModel.getCalendarsForUser(userId);
    res.render('calendarList', { userId, calendars });
};

exports.getCalendarById = (calendarId, userId) => {
    const calendars = exports.getCalendarsForUser(userId);
    return calendars.find(cal => cal.id === calendarId);
};

exports.getUserById = (id) => {
    const users = exports.getUsers();
    return users.find(u => u.id === id);
};
