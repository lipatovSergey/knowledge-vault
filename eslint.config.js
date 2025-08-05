// eslint.config.js
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
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
    },
  },
];
