const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();
app.use(express.json());

// routes connection
const noteRoutes = require("./interface/routes/noteRoutes");
app.use("/api/notes", noteRoutes);

// MongoDb connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log("MongoDb connected");
		app.listen(process.env.PORT || 3000, () => {
			console.log(`Server running on port ${process.env.PORT || 3000}`);
		});
	})
	.catch(error => {
		console.error("MongoDB connection error", error);
	});
