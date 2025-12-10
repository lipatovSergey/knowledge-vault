import bcrypt from "bcrypt";
import { RESET_TOKEN_TTL_MS } from "../../../config/env";
import { random } from "../../../utils/random.util";
import resetTokenRepo from "./password-reset-token.repository.mongo";
import createResetTokenService from "./password-reset-token.service";

const tokenService = createResetTokenService({
  resetTokenRepo,
  bcrypt,
  random,
  ttlMs: RESET_TOKEN_TTL_MS,
});

export type TokenService = typeof tokenService;
export default tokenService;
