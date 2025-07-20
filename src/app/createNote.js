// Use-case: create new note

module.exports = async function createNote(noteData, noteRepo) {
	// simple validation
	// TODO: move to validator
	if ((!noteData.title, !noteData.content, !noteData.userId)) {
		throw new Error("title, content, userId is required");
	}

	// here is buisness logic

	const newNote = await noteRepo.create(noteData);

	return newNote;
};
