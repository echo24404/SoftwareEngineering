const express = require('express');
const path = require('path');

const app = express();

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/src/pages'));

app.get('/', (req, res) => {
    res.render('index');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
