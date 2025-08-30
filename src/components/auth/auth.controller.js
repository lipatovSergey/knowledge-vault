const authServices = require("./auth.services.js");
const userServices = require("../users/user.services.js");
const userRepo = require("../users/user.repository.mongo"); // репозиторий уже есть
const mail = require("../../services/mail/index.js"); // синглтон-почта
const { generateToken } = require("../../utils/token.util.js");
const tokenStore = require("./token-memory.store.js");

const authController = {
  async forgotPassword(req, res, next) {
    try {
      const email = req.validatedData.email; // валидацию добавим в следующей итерации
      const user = await userRepo.findByEmail(email);

      if (user) {
        const rawToken = await generateToken(16);
        tokenStore.save(email, rawToken);
        await mail.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: "Reset token will be added later", // временно
          meta: { rawToken },
        });
      }

      return res
        .status(200)
        .json({ message: "If this account exists, an email has been sent" });
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
      tokenStore.remove(body.email);

      return res
        .status(204)
        .json({ message: "Password has been updated successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
