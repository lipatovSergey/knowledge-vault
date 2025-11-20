import createResetTokenService from "../password-reset-token.service";
import { BadRequestError } from "../../../../errors/errors.class";
import { TokenService } from "..";
import type { ResetTokenRepositoryType } from "../password-reset-token.repository.mongo";
import type { RandomUtilType } from "../../../../utils/random.util";
import type { BcryptAdapter } from "../password-reset-token.service";

describe("PasswordResetTokenService", () => {
  let tokenService: TokenService;
  let mockResetTokenRepo: jest.Mocked<ResetTokenRepositoryType>;
  let mockBcrypt: BcryptAdapter;
  let compareMock: jest.Mock<Promise<boolean>, [string | Buffer, string]>;
  let mockRandom: jest.Mocked<RandomUtilType>;
  let mockTtlMs = 900000;
  const selectorBuffer = Buffer.from("0123456789abcdef");
  const validatorBuffer = Buffer.from("0123456789abcdef0123456789abcdef");
  const selector = selectorBuffer.toString("base64url");
  const validator = validatorBuffer.toString("base64url");

  beforeEach(() => {
    mockResetTokenRepo = {
      create: jest.fn(),
      findActiveBySelector: jest.fn(),
      consumeBySelector: jest.fn(),
      removeAllForUser: jest.fn(),
    };
    compareMock = jest.fn<Promise<boolean>, [string | Buffer, string]>();
    mockBcrypt = {
      hash: jest.fn().mockResolvedValue("mock-hashed-validator"),
      compare: compareMock,
    };
    mockRandom = jest
      .fn()
      .mockResolvedValueOnce(selectorBuffer)
      .mockResolvedValueOnce(validatorBuffer);

    tokenService = createResetTokenService({
      resetTokenRepo: mockResetTokenRepo,
      bcrypt: mockBcrypt,
      random: mockRandom,
      ttlMs: mockTtlMs,
    });
  });
  describe("createTokenForUser", () => {
    it("should correctly call dependencies and return a token pair on user ID", async () => {
      const startTime = Date.now();
      const userId = "654321a99e1e646d1fad1234";
      const tokenPair = await tokenService.createTokenForUser(userId);

      // Assert: Check interactions and output
      expect(mockResetTokenRepo.create).toHaveBeenCalledTimes(1);
      const callArgs = mockResetTokenRepo.create.mock.calls[0][0];
      expect(callArgs.selector).toBe(selector);
      expect(callArgs.validatorHash).toBe("mock-hashed-validator");
      expect(callArgs.userId).toBe("654321a99e1e646d1fad1234");

      // Check that expiresAt is within a reasonable range (e.g., 100ms)
      const expectedExpiresAt = startTime + mockTtlMs;
      const actualExpiresAt = callArgs.expiresAt.getTime();
      expect(actualExpiresAt).toBeGreaterThanOrEqual(expectedExpiresAt);
      expect(actualExpiresAt).toBeLessThan(expectedExpiresAt + 100);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(validator, 10);
      expect(tokenPair).toBe(`${selector}.${validator}`);
    });
  });

  describe("verifyAndConsume", () => {
    it("should verify a valid token, consume it, and return the user ID", async () => {
      // arrange
      const tokenPair = { selector, validator };
      const mockUserId = "654321a99e1e646d1fad1234";
      const mockTokenFromDB = {
        userId: mockUserId,
        validatorHash: "hashed-validator-from-DB",
      };

      mockResetTokenRepo.findActiveBySelector.mockResolvedValue(mockTokenFromDB);

      // act
      compareMock.mockResolvedValueOnce(true);
      const resultUserId = await tokenService.verifyAndConsume(tokenPair);

      // assert
      expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(selector);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(validator, mockTokenFromDB.validatorHash);
      expect(mockResetTokenRepo.consumeBySelector).toHaveBeenCalledWith(selector);
      expect(resultUserId).toBe(mockUserId);
    });

    it("should return BadRequestError and perform dummy hash to prevent timing attacks", async () => {
      const tokenPair = { selector, validator };
      const DUMMY_HASH = "$2b$10$CwTycUXWue0The9StjUM0uJ8c3PHfXcOnItY.r9QB9sSBxWMXyEVO";

      mockResetTokenRepo.findActiveBySelector.mockResolvedValue(null);
      await expect(tokenService.verifyAndConsume(tokenPair)).rejects.toThrow(BadRequestError);
      expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(selector);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(validator, DUMMY_HASH);
    });

    it("should return BadRequestError if passed validator is invalid", async () => {
      const validator = "invalid-validator";
      const tokenPair = { selector, validator };
      const mockTokenFromDB = {
        userId: "some-user-id",
        validatorHash: "hashed-validator-from-DB",
      };

      mockResetTokenRepo.findActiveBySelector.mockResolvedValue(mockTokenFromDB);
      compareMock.mockResolvedValueOnce(false);
      await expect(tokenService.verifyAndConsume(tokenPair)).rejects.toThrow(BadRequestError);

      // Assert that the correct checks were performed
      expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(selector);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(validator, mockTokenFromDB.validatorHash);
      // Assert that the token was NOT consumed on failure
      expect(mockResetTokenRepo.consumeBySelector).not.toHaveBeenCalled();
    });
  });

  describe("removeAllTokensForUser", () => {
    it("should call removeAllForUser with userId", async () => {
      const userId = "user-123";
      await tokenService.removeAllTokensForUser(userId);
      expect(mockResetTokenRepo.removeAllForUser).toHaveBeenCalledWith(userId);
    });
  });
});
