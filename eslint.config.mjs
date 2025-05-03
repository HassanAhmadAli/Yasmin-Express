import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      js,
      "@typescript-eslint": tseslint.plugin,
      react: pluginReact
    },
    extends: [
      "js/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended"
    ],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "prefer-const": "error",
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "quotes": ["error", "single"],
      "jsx-quotes": ["error", "prefer-double"],
      "semi": ["error", "always"]
    }
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
      sourceType: "module",
      ecmaVersion: 2022,
      parserOptions: {
        project: "./tsconfig.json"
      }
    }
  }
]);