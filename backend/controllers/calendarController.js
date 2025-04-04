const calendarModel = require('../models/calendarModel');

/**
 * Renders the user selection page to choose with whom to share the calendar.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
exports.showUserSelection = (req, res) => {
    const users = calendarModel.getUsers();
    res.render('selectUsers', { users });
};

/**
 * Handles the creation of a new calendar and redirects to the user's calendar list.
 * @param {Request} req - Express request object containing form data.
 * @param {Response} res - Express response object.
 */
exports.createCalendar = (req, res) => {
    const { name, ownerId } = req.body;
    let sharedWith = req.body.sharedWith || [];

    if (!Array.isArray(sharedWith)) {
        sharedWith = [sharedWith]; // single checkbox fallback
    }

    calendarModel.createCalendar(ownerId, name, sharedWith);
    res.redirect(`/my-calendars/${ownerId}`);
};

/**
 * Displays a list of calendars belonging to a specific user.
 * @param {Request} req - Express request object (includes userId param).
 * @param {Response} res - Express response object.
 */
exports.showUserCalendars = (req, res) => {
    const userId = req.params.userId;
    const calendars = calendarModel.getCalendarsForUser(userId);
    res.render('calendarList', { userId, calendars });
};

/**
 * Displays a specific calendar view including the events and monthly grid.
 * @param {Request} req - Express request object (includes calendarId and userId).
 * @param {Response} res - Express response object.
 */
exports.showCalendar = (req, res) => {
    const { userId, calendarId } = req.params;
    const calendar = calendarModel.getCalendarById(calendarId, userId);
    if (!calendar) return res.status(404).send('Kalender nicht gefunden');

    const owner = calendarModel.getUserById(calendar.ownerId);
    const allUsers = calendarModel.getUsers();
    const sharedWith = calendar.sharedWith.map(id =>
        allUsers.find(u => u.id === id)
    ).filter(Boolean);

    // Handle dynamic month/year from query string (default to current)
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

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

/**
 * Adds a new event to the specified calendar.
 * @param {Request} req - Express request object with event data.
 * @param {Response} res - Express response object.
 */
exports.addEvent = (req, res) => {
    const { userId, calendarId } = req.params;
    const { date, title } = req.body;

    const success = calendarModel.addEventToCalendar(calendarId, userId, { date, title });

    if (!success) return res.status(404).send('Kalender nicht gefunden');

    res.redirect(`/calendar/${userId}/${calendarId}`);
};

/**
 * Deletes an event from a specific calendar by date and title.
 * @param {Request} req - Express request object containing event data.
 * @param {Response} res - Express response object.
 */
exports.deleteEvent = (req, res) => {
    const { userId, calendarId } = req.params;
    const { date, title } = req.body;

    const success = calendarModel.deleteEventFromCalendar(calendarId, userId, date, title);

    if (!success) return res.status(404).send('Termin konnte nicht gelöscht werden');

    res.redirect(`/calendar/${userId}/${calendarId}`);
};
