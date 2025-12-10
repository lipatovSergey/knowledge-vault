import bcrypt from "bcrypt";
import userRepo from "./user.repository.mongo";
import createUserService from "./user.service";

const userService = createUserService({ userRepo, bcrypt });

export type UserService = typeof userService;
export default userService;
