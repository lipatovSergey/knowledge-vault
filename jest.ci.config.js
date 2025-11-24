module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/dist-ci/tests/test.setup.js"],
  roots: ["<rootDir>/dist-ci/src", "<rootDir>/dist-ci/tests"],
  testMatch: ["**/__tests__/**/*.test.js"],
  transform: {}
};
