const z = require("zod");

const schemas = {
  passwordForgot: z.object({
    email: z.string().email("Invalid email"),
  }),
};

module.exports = {
  schemas,
};
