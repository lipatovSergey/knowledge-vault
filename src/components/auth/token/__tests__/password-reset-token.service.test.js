const {
	createResetTokenService,
} = require("../password-reset-token.service.js");

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
			};

			tokenService = createResetTokenService({
				resetTokenRepo: mockResetTokenRepo,
				bcrypt: mockBcrypt,
				random: null,
				ttlMs: 0,
			});
		});

		it("should return userId for valid token and consume it", async () => {
			const selector = "valid-selector";
			const validator = "valid-validator";
			const tokenPair = `${selector}.${validator}`;
			const fakeStoredToken = {
				userId: "654321a99e1e646d1fad1234",
				validatorHash: "mocked-hashed-validator",
			};

			mockResetTokenRepo.findActiveBySelector.mockResolvedValue(
				fakeStoredToken
			);
			mockBcrypt.compare.mockResolvedValue(true);

			const userId = await tokenService.verifyAndConsume(tokenPair);
			expect(userId).toBe(fakeStoredToken.userId);
			expect(mockResetTokenRepo.findActiveBySelector).toHaveBeenCalledWith(
				selector
			);
			expect(mockBcrypt.compare).toHaveBeenCalledWith(
				validator,
				fakeStoredToken.validatorHash
			);
			expect(mockResetTokenRepo.consumeBySelector).toHaveBeenCalledWith(
				selector
			);
		});
	});
});
