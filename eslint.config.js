import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  ignorePatterns: ["dist"], // ✅ Correct placement
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: "@typescript-eslint/parser", // ✅ Explicit parser for TypeScript
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    "@typescript-eslint": tseslint, // ✅ Explicit TypeScript ESLint plugin
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    "react-x": reactX,       // ✅ Added React-X plugin
    "react-dom": reactDom,   // ✅ Added React-DOM plugin
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  },
});
