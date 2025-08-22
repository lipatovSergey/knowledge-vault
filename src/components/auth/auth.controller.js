const authController = {
  async forgotPassword(req, res, next) {
    return res
      .status(200)
      .json({ message: "If this account exists, an email has been sent" });
  },
};

module.exports = authController;
