const calendarModel = require('../models/calendarModel');

exports.showUserSelection = (req, res) => {
    const users = calendarModel.getUsers();
    res.render('selectUsers', { users });
};
