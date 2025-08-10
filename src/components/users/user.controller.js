const userServices = require("./user.services");
const userRepo = require("./user.repository.mongo");
const destroySession = require("../../utils/destroy-session.util.js");

const userController = {
  async createUser(req, res, next) {
    try {
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      };

      await userServices.createUser(userData, userRepo);
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      next(error);
    }
  },

  async loginUser(req, res, next) {
    try {
      const data = {
        email: req.body.email,
        password: req.body.password,
      };

      const user = await userServices.findUserByEmail(data.email, userRepo);
      await userServices.checkUserPassword(data.password, user.password);

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

  async getUserInfo(req, res, next) {
    try {
      const user = await userServices.findUserById(
        req.session.userId,
        userRepo,
      );

      const { _id, name, email } = user;
      const info = { _id, name, email };
      res.status(200).json(info);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      await userServices.deleteUser(req.session.userId, userRepo);
      await destroySession(req);
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
