require("dotenv").config();
const { PORT } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

// MongoDB connection
connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch(error => {
		console.error("MongoDB connection error", error);
	});
