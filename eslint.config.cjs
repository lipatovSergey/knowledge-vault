const nodePlugin = require("eslint-plugin-n");
// eslint.config.js
module.exports = [
  nodePlugin.configs["flat/recommended-script"],
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
    rules: {
      "no-unused-vars": "warn",
      "no-redeclare": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      eqeqeq: ["error", "always"],
      "n/exports-style": ["error", "module.exports"],
      "n/no-unsupported-features/node-builtins": "error",
      "n/no-unsupported-features/es-syntax": "error",
    },
  },
];
