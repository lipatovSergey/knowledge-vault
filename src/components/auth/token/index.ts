import createResetTokenService from "./password-reset-token.service";
import resetTokenRepo from "./password-reset-token.repository.mongo";
import bcrypt from "bcrypt";
import { random } from "../../../utils/random.util";
import { RESET_TOKEN_TTL_MS } from "../../../config/env";

const tokenService = createResetTokenService({
  resetTokenRepo,
  bcrypt,
  random,
  ttlMs: RESET_TOKEN_TTL_MS,
});

export type TokenService = typeof tokenService;
export default tokenService;
