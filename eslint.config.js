const js = require("@eslint/js");
const globals = require("globals");

const extensionGlobals = {
  ...globals.browser,
  ...globals.serviceworker,
  chrome: "readonly",
  browser: "readonly",
  Orbit: "readonly",
};

module.exports = [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "out/**"],
  },
  js.configs.recommended,
  {
    files: ["background.js", "content.js", "logo.js", "options.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: extensionGlobals,
    },
  },
  {
    files: ["shared.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^Orbit$" }],
    },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
];