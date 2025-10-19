const { createNoteService } = require("./note.service.js");
const noteRepo = require("./note.repository.mongo.js");

const noteService = createNoteService({ noteRepo });

module.exports = { noteService };
