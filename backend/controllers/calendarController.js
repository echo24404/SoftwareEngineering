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

    // 📅 Monat und Jahr dynamisch über URL (Fallback: aktueller Monat)
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1; // 1-basiert

    const daysInMonth = new Date(year, month, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const events = calendar.events.filter(e => e.date === dateStr);
        return { date: dateStr, events };
    });

    const monthName = new Date(year, month - 1, 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    res.render('calendarView', {
        calendar,
        owner,
        sharedWith,
        days,
        month,
        year,
        monthName
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
