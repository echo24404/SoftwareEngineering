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

exports.showCalendar = (req, res) => {
    const { userId, calendarId } = req.params;

    const calendar = calendarModel.getCalendarById(calendarId, userId);
    if (!calendar) return res.status(404).send('Kalender nicht gefunden');

    const owner = calendarModel.getUserById(calendar.ownerId);
    const allUsers = calendarModel.getUsers();
    const sharedWith = calendar.sharedWith.map(id =>
        allUsers.find(u => u.id === id)
    ).filter(Boolean);

    res.render('calendarView', {
        calendar,
        owner,
        sharedWith
    });
};

exports.addEvent = (req, res) => {
    const { userId, calendarId } = req.params;
    const { date, title } = req.body;

    const success = calendarModel.addEventToCalendar(calendarId, userId, { date, title });

    if (!success) return res.status(404).send('Kalender nicht gefunden');

    res.redirect(`/calendar/${userId}/${calendarId}`);
};

exports.deleteEvent = (req, res) => {
    const { userId, calendarId } = req.params;
    const { date, title } = req.body;

    const success = calendarModel.deleteEventFromCalendar(calendarId, userId, date, title);

    if (!success) return res.status(404).send('Termin konnte nicht gelöscht werden');

    res.redirect(`/calendar/${userId}/${calendarId}`);
};
