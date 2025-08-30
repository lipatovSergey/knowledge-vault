const { BadRequestError } = require("../../errors/errors.class.js");
const tokenStore = require("./token-memory.store.js");
const { RESET_TOKEN_TTL_MS } = require("../../config/env.js");

function checkTokens(data) {
  const inMemoryToken = tokenStore.get(data.email);

  if (!inMemoryToken) {
    throw new BadRequestError("Invalid or expired token");
  }

  if (inMemoryToken.token !== data.token) {
    throw new BadRequestError("Invalid or expired token");
  }

  if (Date.now() - inMemoryToken.createdAt > RESET_TOKEN_TTL_MS) {
    tokenStore.remove(data.email);
    throw new BadRequestError("Invalid or expired token");
  }
}

module.exports = {
  checkTokens,
};
