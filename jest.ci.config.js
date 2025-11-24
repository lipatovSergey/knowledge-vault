module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dist-ci/tests/setup-env.js"],
  setupFilesAfterEnv: ["<rootDir>/dist-ci/tests/test.setup.js"],
  roots: ["<rootDir>/dist-ci/src", "<rootDir>/dist-ci/tests"],
  testMatch: ["**/__tests__/**/*.test.js"],
  transform: {},
};
