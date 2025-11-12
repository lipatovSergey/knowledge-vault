import InMemoryMailService from "./in-memory-mail.service";

const mailService = new InMemoryMailService();

export type MailService = typeof mailService;
export default mailService;
