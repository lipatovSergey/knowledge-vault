function toNoteDto(raw) {
	// if we got note as plain object use it as it is
	// if note mongoose document use build in toObject method to create plain object
	const source = typeof raw.toObject === "function" ? raw.toObject() : raw;

	return {
		id: source._id.toString(),
		title: source.title,
		content: source.content,
		createdAt: source.createdAt,
		updatedAt: source.updatedAt,
	};
}

module.exports = { toNoteDto };
