import userService from "../user";
import tokenService from "./token";
import createAuthService from "./auth.service";

const authService = createAuthService({ userService, tokenService });

export default authService;
