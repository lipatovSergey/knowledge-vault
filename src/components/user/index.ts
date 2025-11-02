import createUserService from "./user.service.js";
import userRepo from "./user.repository.mongo.js";
import bcrypt from "bcrypt";

const userService = createUserService({ userRepo, bcrypt });

export default userService;
