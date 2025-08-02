const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const { store } = require("../src/middleware/session.middleware");
beforeAll(async () => {
	await connectDB();
});

afterEach(async () => {
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongoose.disconnect();
	if (store?.close) {
		await store.close();
	}
});
