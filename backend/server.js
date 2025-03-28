const express = require("express");
const path = require("path");
const app = express();

// Konfiguration der Template-Engine und des Views-Verzeichnisses
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/src/pages"));

// Statische Dateien aus dem Frontend bereitstellen
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Import und Verwendung der Index-Route (Beispiel)
const indexRoutes = require("./routes/homepageRoutes");
app.use("/", indexRoutes);

// Import und Verwendung der neuen Tasks-Route
const tasksRoutes = require("./routes/tasksRoutes");
app.use("/tasks", tasksRoutes);

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
