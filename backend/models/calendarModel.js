const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const calendarPath = path.join(__dirname, '../data/calendar.json');


exports.getUsers = () => {
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data);
};

const loadCalendars = () => {
    if (!fs.existsSync(calendarPath)) return [];
    const data = fs.readFileSync(calendarPath);
    return JSON.parse(data);
};
