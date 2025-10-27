const {
  createResetTokenService,
} = require("./password-reset-token.service.js");
const resetTokenRepo = require("./password-reset-token.repository.mongo.js");
const bcrypt = require("bcrypt");
const { random } = require("../../../utils/random.util.js");

// TODO: заменить ttlMs на имрорт из config/env
const tokenService = createResetTokenService({
  resetTokenRepo,
  bcrypt,
  random,
  ttlMs: 900000,
});

module.exports = { tokenService };
