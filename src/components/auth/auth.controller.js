const authServices = require("./auth.services.js");
const userServices = require("../users/user.services.js");
const userRepo = require("../users/user.repository.mongo"); // репозиторий уже есть
const mail = require("../../services/mail/index.js"); // синглтон-почта
const { generateToken } = require("../../utils/token.util.js");
const tokenStore = require("./token-memory.store.js");
const destroySession = require("../../utils/destroy-session.util.js");

const authController = {
  async forgotPassword(req, res, next) {
    try {
      const email = req.validatedData.email;
      const user = await userRepo.findByEmail(email);

      if (user) {
        const rawToken = await generateToken(16);
        await mail.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: "Reset token will be added later",
          meta: { rawToken },
        });
        tokenStore.save(email, rawToken);
      }

      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const body = req.validatedData;
      await authServices.checkTokens(body);
      await userServices.updateUserPassword(
        body.email,
        body.newPassword,
        userRepo,
      );
      await tokenStore.remove(body.email);
      await destroySession(req);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
