const { userService } = require("../users/index.js");
const mail = require("../../services/mail/index.js");
const { UnauthorizedError } = require("../../errors/errors.class.js");
const destroySession = require("../../utils/destroy-session.util.js");
const { tokenService } = require("./token/index.js");
const regenerateSession = require("../../utils/regenerate-session.util.js");

const authController = {
  async loginUser(req, res, next) {
    try {
      const data = {
        email: req.validatedBody.email,
        password: req.validatedBody.password,
      };

      const user = await userService.findUserByEmail(data.email);
      await userService.checkUserPassword(data.password, user.password);
      // regenerate session ID for authentificated user
      await regenerateSession(req);
      req.session.userId = user._id;
      return res.status(200).json({ message: "Login successful" });
    } catch (error) {
      next(error);
    }
  },

  async logoutUser(req, res, next) {
    try {
      await destroySession(req);
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const email = req.validatedBody.email;
      // We try to find the user. If the service throws UnauthorizedError (user not found),
      // we catch it and treat it as a "success" from a security perspective to prevent email enumeration.
      const user = await userService.findUserByEmail(email).catch((err) => {
        if (err instanceof UnauthorizedError) return null;
        throw err;
      });

      if (user) {
        const rawToken = await tokenService.createTokenForUser(user._id);
        // TODO: заменить на FRONTEND_URL из config/env
        const frontendBaseUrl = "localhost:2173";
        const resetLink = `${frontendBaseUrl.replace(
          /\/$/,
          "",
        )}/password-reset?token=${rawToken}`;
        await mail.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: `To reset your password please use the following link ${resetLink}`,
          html: `<p>Hello,</p><p>You requested a password reset. Please click the link below to set a new password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
          meta: { rawToken }, // for tests
        });
      }

      return res.status(204).end();
    } catch (err) {
      return next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const body = req.validatedBody;
      const token = req.validatedResetToken;
      const userId = await tokenService.verifyAndConsume(token);
      await userService.updateUserPassword(userId, body.newPassword);
      await tokenService.removeAllTokensForUser(userId);
      await destroySession(req);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
