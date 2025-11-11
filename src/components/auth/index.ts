import userService from "../user";
import createAuthService from "./auth.service";

const authService = createAuthService({ userService });

export default authService;
