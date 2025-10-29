import createNoteService from "./note.service";
import noteRepo from "./note.repository.mongo";

const noteService = createNoteService({ noteRepo });

export default noteService;
