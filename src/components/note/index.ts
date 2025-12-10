import noteRepo from "./note.repository.mongo";
import createNoteService from "./note.service";

const noteService = createNoteService({ noteRepo });

export default noteService;
