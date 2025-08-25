const userRepo = require("../users/user.repository.mongo"); // репозиторий уже есть
const mail = require("../../services/mail/index.js");                 // синглтон-почта

const authController = {
  async forgotPassword(req, res, next) {
    try {
      const email = req.body?.email; // валидацию добавим в следующей итерации
      const user = await userRepo.findByEmail(email);

      if (user) {
        await mail.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: "Reset token will be added later", // временно
        });
      }

      return res
        .status(200)
        .json({ message: "If this account exists, an email has been sent" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;