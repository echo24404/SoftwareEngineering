const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.get('/', calendarController.showUserSelection);

module.exports = router;

router.post('/create-calendar', calendarController.createCalendar);
router.get('/my-calendars/:userId', calendarController.showUserCalendars);
router.get('/calendar/:userId/:calendarId', calendarController.showCalendar);
router.post('/calendar/:userId/:calendarId/add-event', calendarController.addEvent);
router.post('/calendar/:userId/:calendarId/delete-event', calendarController.deleteEvent);
