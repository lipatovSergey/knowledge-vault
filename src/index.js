const { PORT } = require("./config/env");
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());

// routes connection
const noteRoutes = require("./interface/routes/noteRoutes");
app.use("/api/notes", noteRoutes);

// MongoDb connection
connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch(error => {
		console.error("MongoDB connection error", error);
	});
