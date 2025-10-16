const nodePlugin = require("eslint-plugin-n");
const jsdoc = require("eslint-plugin-jsdoc");
// eslint.config.js
module.exports = [
  nodePlugin.configs["flat/recommended-script"],
  jsdoc.configs["flat/recommended"],
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: { jsdoc },
    rules: {
      "no-unused-vars": "warn",
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
];
