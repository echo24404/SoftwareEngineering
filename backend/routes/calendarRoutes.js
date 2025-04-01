const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.get('/', calendarController.showUserSelection);

module.exports = router;

router.post('/create-calendar', calendarController.createCalendar);
router.get('/my-calendars/:userId', calendarController.showUserCalendars);
