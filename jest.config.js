/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/test.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
};
