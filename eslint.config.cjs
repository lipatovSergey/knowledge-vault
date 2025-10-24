const eslintConfig = require("@eslint/js");
const nodePlugin = require("eslint-plugin-n");
const jestPlugin = require("eslint-plugin-jest");
const jsdoc = require("eslint-plugin-jsdoc");
const globals = require("globals");
// eslint.config.js
module.exports = [
  eslintConfig.configs.recommended,
  nodePlugin.configs["flat/recommended-script"],
  jsdoc.configs["flat/recommended"],
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        console: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: { jsdoc },
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-redeclare": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      eqeqeq: ["error", "always"],
      "n/exports-style": ["error", "module.exports"],
      "n/no-unsupported-features/node-builtins": "error",
      "n/no-unsupported-features/es-syntax": "error",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-jsdoc": ["off", { publicOnly: true }],
    },
  },
  {
    files: ["**/*.test.js", "**/__tests__/**/*.js", "tests/**/*.js"],
    ...jestPlugin.configs["flat/recommended"],
    languageOptions: {
      ...jestPlugin.configs["flat/recommended"].languageOptions,
      globals: {
        ...jestPlugin.configs["flat/recommended"].languageOptions.globals,
        ...globals.node,
      },
    },
    rules: {
      "jest/expect-expect": [
        "warn",
        {
          assertFunctionNames: [
            "expect",
            "expectValidationError",
            "expectConflictError",
            "expectUnauthorizedError",
            "expectNotFoundError",
            "expectBadRequestError",
          ],
        },
      ],
    },
  },
];
