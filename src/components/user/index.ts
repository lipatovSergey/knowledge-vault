import createUserService from "./user.service";
import userRepo from "./user.repository.mongo";
import bcrypt from "bcrypt";

const userService = createUserService({ userRepo, bcrypt });

export type UserService = typeof userService;
export default userService;
