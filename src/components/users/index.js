const { createUserService } = require("./user.service.js");
const userRepo = require("./user.repository.mongo.js");
const bcrypt = require("bcrypt");

const userService = createUserService({ userRepo, bcrypt });

module.exports = { userService };
