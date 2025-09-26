const { randomBytes } = require("node:crypto");
const { promisify } = require("node:util");
// make promise from callback
const randomBytesAsync = promisify(randomBytes);

async function random(len) {
  return await randomBytesAsync(len);
}

module.exports = { random };
