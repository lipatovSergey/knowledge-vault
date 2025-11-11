import express, { RequestHandler } from "express";
import userController from "./user.controller";
// middlewares
import requireAuth from "../../middleware/require-auth.middleware";
import validateBody from "../../middleware/validate-body.middleware";
// validate chemas
import { userMePatchRequestSchema } from "../../contracts/user/me.contract";
import { userRootPostRequestSchema } from "../../contracts/user/root.contract";

const router = express.Router();
// create new user
router.post(
  "/",
  validateBody(userRootPostRequestSchema),
  userController.createUser as RequestHandler,
);
// get user's info by himself (authenticated)
router.get("/me", requireAuth, userController.getUserInfo);
// delete user by himself(authenticated)
router.delete("/me", requireAuth, userController.deleteUser);
// update user info
router.patch(
  "/me",
  requireAuth,
  validateBody(userMePatchRequestSchema),
  userController.updateUserData as RequestHandler,
);

export default router;
