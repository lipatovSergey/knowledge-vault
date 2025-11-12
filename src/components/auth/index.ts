import userService from "../user";
import tokenService from "./token";
import createAuthService from "./auth.service";
import mailService from "../../services/mail";

const authService = createAuthService({ userService, tokenService, mailService });

export default authService;
