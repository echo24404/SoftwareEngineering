const express = require("express");
const path = require("path");
const app = express();
// Konfiguration der Template-Engine und des Views-Verzeichnisses
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Statische Dateien aus dem Frontend bereitstellen
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Import und Verwendung der Index-Route
const indexRoutes = require("./routes/index");
app.use("/", indexRoutes);

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));