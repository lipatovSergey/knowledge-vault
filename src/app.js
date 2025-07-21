const express = require("express");

const app = express();
app.use(express.json());

// note routes connection
const noteRoutes = require("./components/notes/noteRoutes");
app.use("/api/notes", noteRoutes);

// user routes connection
const userRoutes = require("./components/users/userRoutes");
app.use("/api/users", userRoutes);

module.exports = app;
