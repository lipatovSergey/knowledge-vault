const express = require("express");

const app = express();
app.use(express.json());

// routes connection
const noteRoutes = require("./components/notes/noteRoutes");
app.use("/api/notes", noteRoutes);

module.exports = app;
