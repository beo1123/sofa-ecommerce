import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierPlugin from "eslint-plugin-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export default [
  // ================= Ignore các file build, config, generated =================
  {
    ignores: [
      "generated/**",
      "prisma/**",
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "public/**",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "**/*.config.ts", // ignore all config ts files including next.config.ts
      "commitlint.config.cjs",
    ],
  },

  // ================= Config JS cơ bản =================
  js.configs.recommended,

  // ================= Config TS cho src files =================
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: ["./tsconfig.json"], // type-aware linting chỉ cho src TS files
      },
      globals: {
        window: "readonly",
        document: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImportsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "unused-imports/no-unused-imports": "warn",
      "prettier/prettier": ["error"],
    },
  },

  // ================= React & Hooks & A11y =================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/no-unknown-property": "error",
    },
    settings: { react: { version: "detect" } },
  },

  // ================= Override config files (disable type-aware linting) =================
  {
    files: [
      "*.config.js",
      "*.config.cjs",
      "*.config.mjs",
      "*.config.ts",
      "commitlint.config.cjs",
      "postcss.config.mjs",
      "prettier.config.cjs",
      "eslint.config.js",
      "eslint.config.mjs",
      "next.config.ts",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: undefined, // tắt type-aware linting cho config
      },
      globals: {
        process: "readonly",
        console: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {},
  },
];
