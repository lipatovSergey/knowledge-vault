import userService from "./index";
import destroySession from "../../utils/destroy-session.util";
import type { Request, Response, NextFunction } from "express";
import type { RequestWithValidatedBody } from "../../types/validated-request";
import type { MongoId } from "../../types/primitives";
import type { UserMeGetResponse, UserMePatchRequest } from "../../contracts/user/me.contract";
import type { UserRootPostRequest } from "../../contracts/user/root.contract";
import type { CreateUserInput, UpdateUserInput, UserDomain } from "./user.types";
import { mapDomainUserToContract } from "./user.mapper";

const userController = {
  async createUser(
    req: RequestWithValidatedBody<UserRootPostRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const createUserInput: CreateUserInput = {
        name: req.validatedBody.name,
        email: req.validatedBody.email,
        password: req.validatedBody.password,
      };

      await userService.createUser(createUserInput);
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.session.userId as MongoId;
      const userDomain: UserDomain = await userService.findUserById(userId);
      const userContract: UserMeGetResponse = mapDomainUserToContract(userDomain);

      res.status(200).json(userContract);
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
    req: RequestWithValidatedBody<UserMePatchRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const updateUserInput: UpdateUserInput = {
        userId: req.session.userId as MongoId,
        ...req.validatedBody,
      };
      const user = await userService.updateUserData(updateUserInput);
      const userContract = mapDomainUserToContract(user);
      res.status(200).json(userContract);
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
