const userServices = require("../users/user.services.js");
const userRepo = require("../users/user.repository.mongo");
const mail = require("../../services/mail/index.js");
const destroySession = require("../../utils/destroy-session.util.js");
const { tokenService } = require("./token/index.js");

const authController = {
	async forgotPassword(req, res, next) {
		try {
			const email = req.validatedData.email;
			const user = await userRepo.findByEmail(email);

			if (user) {
				const rawToken = await tokenService.createTokenForUser(user._id);
				const resetLink = `frontend-url/password-reset?token${rawToken}`;
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
			next(err);
		}
	},

	async resetPassword(req, res, next) {
		try {
			const body = req.validatedData;
			const userId = await tokenService.verifyAndConsume(body.token);
			console.log(userId);
			await userServices.updateUserPassword(userId, body.newPassword, userRepo);
			await tokenService.removeAllTokensForUser(userId);
			await destroySession(req);
			return res.status(204).end();
		} catch (err) {
			next(err);
		}
	},
};

module.exports = authController;
