/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/test.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.[tj]s", "<rootDir>/tests/**/*.test.[tj]s"],
};
