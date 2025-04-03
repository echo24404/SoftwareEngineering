const express = require('express');
const router = express.Router();

router.get('/timetable', (req, res) => {
    res.render('timetableEmbed', { timetableUrl: null });
});

router.post('/timetable', (req, res) => {
    const { link } = req.body;
    res.render('timetableEmbed', { timetableUrl: link });
});

module.exports = router;
