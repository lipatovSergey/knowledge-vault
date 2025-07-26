const mongoose = require("mongoose");
const connectDB = require("./db");
const { store } = require("../middleware/session");
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
