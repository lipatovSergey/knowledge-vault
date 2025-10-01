const {
	createResetTokenService,
} = require("../password-reset-token.service.js");
const { BadRequestError } = require("../../../../errors/errors.class");

describe("PasswordResetTokenService", () => {
	describe("createTokenForUser", () => {
		let tokenService;
		let mockResetTokenRepo;
		let mockBcrypt;
		let mockRandom;
		let mockTtlMs = 900000;

		beforeEach(() => {
			mockResetTokenRepo = {
				create: jest.fn(),
			};
			mockBcrypt = {
				hash: jest.fn().mockResolvedValue("mock-hashed-validator"),
			};
			mockRandom = jest
				.fn()
				.mockResolvedValueOnce(Buffer.from("fake-selector-bytes"))
				.mockResolvedValueOnce(Buffer.from("fake-validator-bytes"));

			tokenService = createResetTokenService({
				resetTokenRepo: mockResetTokenRepo,
				bcrypt: mockBcrypt,
				random: mockRandom,
				ttlMs: mockTtlMs,
			});
		});

		it("should correctly call dependencies and return a token pair on user ID", async () => {
			const startTime = Date.now();
			const userId = "654321a99e1e646d1fad1234";
			const tokenPair = await tokenService.createTokenForUser(userId);

			// Assert: Check interactions and output
			expect(mockResetTokenRepo.create).toHaveBeenCalledTimes(1);
			const callArgs = mockResetTokenRepo.create.mock.calls[0][0];
			expect(callArgs.selector).toBe("ZmFrZS1zZWxlY3Rvci1ieXRlcw");
			expect(callArgs.validatorHash).toBe("mock-hashed-validator");
			expect(callArgs.userId).toBe("654321a99e1e646d1fad1234");

			// Check that expiresAt is within a reasonable range (e.g., 100ms)
			const expectedExpiresAt = startTime + mockTtlMs;
			const actualExpiresAt = callArgs.expiresAt.getTime();
			expect(actualExpiresAt).toBeGreaterThanOrEqual(expectedExpiresAt);
			expect(actualExpiresAt).toBeLessThan(expectedExpiresAt + 100);

			expect(mockBcrypt.hash).toHaveBeenCalledWith(
				"ZmFrZS12YWxpZGF0b3ItYnl0ZXM",
				10
			);
			expect(tokenPair).toBe(
				"ZmFrZS1zZWxlY3Rvci1ieXRlcw.ZmFrZS12YWxpZGF0b3ItYnl0ZXM"
			);
		});
	});

	describe("verifyAndConsume", () => {
		let tokenService;
		let mockResetTokenRepo;
		let mockBcrypt;
		beforeEach(() => {
			mockResetTokenRepo = {
				findActiveBySelector: jest.fn(),
				consumeBySelector: jest.fn(),
			};

			mockBcrypt = {
				compare: jest.fn(),
				hash: jest.fn(),
			};

			tokenService = createResetTokenService({
				resetTokenRepo: mockResetTokenRepo,
				bcrypt: mockBcrypt,
				random: jest.fn(),
				ttlMs: 900000,
			});
		});

		it("should verify a valid token, consume it, and return the user ID", async () => {
			// arrange
			const selector = "valid-selector";
			const validator = "valid-validator";
			const tokenPair = `${selector}.${validator}`;
			const mockUserId = "user-123";
			const mockTokenFromDB = {
				userId: mockUserId,
				validatorHash: "hashed-validator-from-DB",
			};

			mockResetTokenRepo.findActiveBySelector.mockResolvedValue(
				mockTokenFromDB
			);
			mockBcrypt.compare.mockResolvedValue(true);

			// act
			const resultUserId = await tokenService.verifyAndConsume(tokenPair);

			// assert
			expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(
				selector
			);
			expect(mockBcrypt.compare).toHaveBeenCalledWith(
				validator,
				mockTokenFromDB.validatorHash
			);
			expect(mockResetTokenRepo.consumeBySelector).toHaveBeenCalledWith(
				selector
			);
			expect(resultUserId).toBe(mockUserId);
		});

		it.each([
			["null", null],
			["undefined", undefined],
			["not a string", 12345],
			["an empty string", ""],
			["missing a dot", "invalidtoken"],
			["with a leading dot", ".invalidtoken"],
			["with a trailing dot", "invalidtoken."],
		])(
			"should throw BadRequestError if passed token pair is %s",
			async (_, invalidTokenPair) => {
				await expect(
					tokenService.verifyAndConsume(invalidTokenPair)
				).rejects.toThrow(BadRequestError);
			}
		);

		it("should throw BadRequestError and perform dummy hash to prevent timing attacks", async () => {
			const selector = "non-existing-selector";
			const validator = "any-validator";
			const tokenPair = `${selector}.${validator}`;
			const dummyHash = "dummy-hashed-value";

			mockResetTokenRepo.findActiveBySelector.mockResolvedValue(null);
			mockBcrypt.hash.mockResolvedValue(dummyHash);
			await expect(tokenService.verifyAndConsume(tokenPair)).rejects.toThrow(
				BadRequestError
			);
			expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(
				selector
			);
			expect(mockBcrypt.hash).toHaveBeenCalledWith("dummy", 10);
			expect(mockBcrypt.compare).toHaveBeenCalledWith(validator, dummyHash);
		});

		it("should throw BadRequestError if passed validator is invalid", async () => {
			const selector = "valid-selector";
			const validator = "invalid-validator";
			const tokenPair = `${selector}.${validator}`;
			const mockTokenFromDB = {
				userId: "some-user-id",
				validatorHash: "hashed-validator-from-DB",
			};

			mockResetTokenRepo.findActiveBySelector.mockResolvedValue(
				mockTokenFromDB
			);
			mockBcrypt.compare.mockResolvedValue(false);

			await expect(tokenService.verifyAndConsume(tokenPair)).rejects.toThrow(
				BadRequestError
			);

			// Assert that the correct checks were performed
			expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(
				selector
			);
			expect(mockBcrypt.compare).toHaveBeenCalledWith(
				validator,
				mockTokenFromDB.validatorHash
			);
			// Assert that the token was NOT consumed on failure
			expect(mockResetTokenRepo.consumeBySelector).not.toHaveBeenCalled();
		});
	});

	describe("removeAllTokensForUser", () => {
		let tokenService;
		let mockResetTokenRepo;

		beforeEach(() => {
			mockResetTokenRepo = {
				removeAllForUser: jest.fn(),
			};

			tokenService = createResetTokenService({
				resetTokenRepo: mockResetTokenRepo,
				bcrypt: jest.fn(),
				random: jest.fn(),
				ttlMs: 900000,
			});
		});

		it("should call removeAllForUser with userId", async () => {
			const userId = "user-123";
			await tokenService.removeAllTokensForUser(userId);
			expect(mockResetTokenRepo.removeAllForUser).toHaveBeenCalledWith(userId);
		});

		it.each([
			["null", null],
			["undefined", undefined],
			["a number", 12345],
			["an object", {}],
		])(
			"should throw BadRequestError if passed token is %s",
			async (_, invalidUserId) => {
				await expect(
					tokenService.removeAllTokensForUser(invalidUserId)
				).rejects.toThrow(BadRequestError);
			}
		);
	});
});
