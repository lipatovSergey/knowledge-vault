const {
	createResetTokenService,
} = require("../password-reset-token.service.js");

describe("PasswordResetTokenService", () => {
	let tokenService;
	let mockResetTokenRepo;
	let mockBcrypt;
	let mockRandom;
	let mockNow;
	let mockTtlMs = 9000000;

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
		mockNow = jest
			.fn()
			.mockReturnValue(new Date("2025-01-01T00:00:00.000Z").getTime());

		tokenService = createResetTokenService({
			resetTokenRepo: mockResetTokenRepo,
			bcrypt: mockBcrypt,
			random: mockRandom,
			ttlMs: mockTtlMs,
			now: mockNow,
		});
	});

	it("should correctly call dependencies and return a token pair on user ID", async () => {
		const userId = "654321a99e1e646d1fad1234";
		const tokenPair = await tokenService.createTokenForUser(userId);

		// Assert: Check interactions and output
		expect(mockResetTokenRepo.create).toHaveBeenCalledWith({
			selector: "ZmFrZS1zZWxlY3Rvci1ieXRlcw",
			validatorHash: "mock-hashed-validator",
			userId: "654321a99e1e646d1fad1234",
			expiresAt: new Date(mockNow() + mockTtlMs),
		});
		expect(mockBcrypt.hash).toHaveBeenCalledWith(
			"ZmFrZS12YWxpZGF0b3ItYnl0ZXM",
			10
		);
		expect(tokenPair).toBe(
			"ZmFrZS1zZWxlY3Rvci1ieXRlcw.ZmFrZS12YWxpZGF0b3ItYnl0ZXM"
		);
	});
});
