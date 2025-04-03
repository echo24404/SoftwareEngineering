const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const calendarPath = path.join(__dirname, '../data/calendar.json');

/**
 * Loads all users from the users.json file.
 * @returns {Array<Object>} List of all user objects.
 */
exports.getUsers = () => {
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data);
};

/**
 * Retrieves a user by their ID.
 * @param {string} id - Unique user ID.
 * @returns {Object|undefined} The user object if found, otherwise undefined.
 */
exports.getUserById = (id) => {
    return exports.getUsers().find(user => user.id === id);
};

/**
 * Loads all calendars from the calendar.json file.
 * @returns {Array<Object>} List of all calendar objects.
 * @private
 */
const loadCalendars = () => {
    if (!fs.existsSync(calendarPath)) return [];
    const data = fs.readFileSync(calendarPath);
    return JSON.parse(data);
};

/**
 * Saves the given list of calendars to the calendar.json file.
 * @param {Array<Object>} calendars - List of calendars to save.
 * @private
 */
const saveCalendars = (calendars) => {
    fs.writeFileSync(calendarPath, JSON.stringify(calendars, null, 2));
};

/**
 * Creates and saves a new calendar.
 * @param {string} ownerId - The ID of the calendar owner.
 * @param {string} name - The display name of the calendar.
 * @param {Array<string>} [sharedWith=[]] - Array of user IDs the calendar is shared with.
 * @param {string|null} [color=null] - Optional calendar color.
 * @returns {Object} The newly created calendar object.
 */
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

/**
 * Retrieves all calendars that belong to a specific user.
 * @param {string} userId - ID of the user.
 * @returns {Array<Object>} Array of calendar objects owned by the user.
 */
exports.getCalendarsForUser = (userId) => {
    const calendars = loadCalendars();
    return calendars.filter(c => c.ownerId === userId);
};

/**
 * Retrieves a specific calendar by its ID and owner ID.
 * @param {string} calendarId - Calendar ID.
 * @param {string} userId - Owner's user ID.
 * @returns {Object|undefined} The calendar object if found, otherwise undefined.
 */
exports.getCalendarById = (calendarId, userId) => {
    const calendars = loadCalendars();
    return calendars.find(c => c.id === calendarId && c.ownerId === userId);
};

/**
 * Adds a new event to a user's calendar.
 * @param {string} calendarId - Calendar ID.
 * @param {string} userId - Owner's user ID.
 * @param {Object} event - Event object to add.
 * @param {string} event.date - Date of the event (e.g., "2025-04-05").
 * @param {string} event.title - Title of the event.
 * @returns {boolean} True if event was successfully added, false if calendar not found.
 */
exports.addEventToCalendar = (calendarId, userId, event) => {
    const calendars = loadCalendars();
    const calendar = calendars.find(c => c.id === calendarId && c.ownerId === userId);
    if (!calendar) return false;

    calendar.events.push(event);
    saveCalendars(calendars);
    return true;
};

/**
 * Deletes an event from a user's calendar.
 * @param {string} calendarId - Calendar ID.
 * @param {string} userId - Owner's user ID.
 * @param {string} date - Date of the event.
 * @param {string} title - Title of the event.
 * @returns {boolean} True if the event was successfully deleted, false if calendar not found.
 */
exports.deleteEventFromCalendar = (calendarId, userId, date, title) => {
    const calendars = loadCalendars();
    const calendar = calendars.find(c => c.id === calendarId && c.ownerId === userId);
    if (!calendar) return false;

    calendar.events = calendar.events.filter(e => !(e.date === date && e.title === title));
    saveCalendars(calendars);
    return true;
};
