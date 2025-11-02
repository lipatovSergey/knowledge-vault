import userService from "./index";
import destroySession from "../../utils/destroy-session.util";
import type { Request, Response, NextFunction } from "express";
import type { RequestWithValidatedBody } from "../../types/validated-request";
import { CreateUserDto, UpdateUserDto } from "./user.validator";
import { MongoId } from "../../types/mongo";

const userController = {
  async createUser(
    req: RequestWithValidatedBody<CreateUserDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userData = {
        name: req.validatedBody.name,
        email: req.validatedBody.email,
        password: req.validatedBody.password,
      };

      await userService.createUser(userData);
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.session.userId as MongoId;
      const user = await userService.findUserById(userId);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.session.userId as MongoId;
      await userService.deleteUser(userId);
      await destroySession(req);
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      next(error);
    }
  },

  async updateUserData(
    req: RequestWithValidatedBody<UpdateUserDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.validatedBody;
      const userId = req.session.userId as MongoId;
      const updatedName = await userService.updateUserData(userId, data);
      res.status(200).json({ updatedName: updatedName });
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
