const express = require('express');
const path = require('path');
const calendarRoutes = require('./routes/calendarRoutes');
const timetableRoutes = require('./routes/timetableRoutes');


const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/src/pages'));

app.use('/', calendarRoutes);
app.use('/', timetableRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
