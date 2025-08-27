const { randomBytes } = require("node:crypto");
const { promisify } = require("node:util");
// make promise from callback
const randomBytesAsync = promisify(randomBytes);

async function generateToken(len = 16) {
  const buf = await randomBytesAsync(len);
  return buf.toString("hex");
}

module.exports = { generateToken };
