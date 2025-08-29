const { BadRequestError } = require("../../errors/errors.class.js");
const tokenStore = require("./token-memory.store.js");

async function checkTokens(data) {
  const inMemoryToken = tokenStore.get(data.email).token;
  if (inMemoryToken !== data.token) {
    throw new BadRequestError("Invalid or expired token");
  }
}

module.exports = {
  checkTokens,
};
