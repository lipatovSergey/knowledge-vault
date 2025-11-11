import { UserService } from "../user";
import { LoginInput } from "./auth.types";

function createAuthService({ userService }: { userService: UserService }) {
  return {
    async login(loginInput: LoginInput) {
      return userService.authenticateUser(loginInput);
    },
  };
}

export default createAuthService;
