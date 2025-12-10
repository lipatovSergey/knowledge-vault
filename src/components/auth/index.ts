import mailService from "../../services/mail";
import userService from "../user";
import createAuthService from "./auth.service";
import tokenService from "./token";

const authService = createAuthService({ userService, tokenService, mailService });

export default authService;
