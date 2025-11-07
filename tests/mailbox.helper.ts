import mailService from "../src/services/mail";

export const clear = () => mailService.clear();
export const lastTo = (email: string) => mailService.lastTo(email);
export const getSent = () => mailService.getSent();

