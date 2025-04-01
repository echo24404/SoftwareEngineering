const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

exports.getUsers = () => {
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data);
};
