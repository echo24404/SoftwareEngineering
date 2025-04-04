const express = require("express");
const path = require("path");
const app = express();

// Body-Parser (for POST form data)
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Configuration of the template engine and the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/src/pages"));

// Import and use the index route (example)
const indexRoutes = require("./routes/homepageRoutes");
app.use("/", indexRoutes);

// Import and use the new tasks route
const tasksRoutes = require("./routes/tasksRoutes");
app.use("/tasks", tasksRoutes);

const signupRoutes = require("./routes/signupRoutes");
app.use("/signup", signupRoutes);

const loginRoutes = require("./routes/loginRoutes");
app.use("/login", loginRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
