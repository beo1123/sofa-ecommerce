import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierPlugin from "eslint-plugin-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

/**
 * ESLint Configuration — Next.js + TypeScript + React Query + Redux Toolkit
 * Includes: Prettier, Unused Imports, Jest, A11y
 */
export default [
  // ================= IGNORE build/config/generated =================
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
      "**/*.config.ts",
      "commitlint.config.cjs",
    ],
  },

  // ================= Base JS Config =================
  js.configs.recommended,

  // ================= TypeScript for src =================
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: ["./tsconfig.json"], // enable type-aware linting for src
      },
      globals: {
        window: "readonly",
        document: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        process: "readonly",
        console: "readonly", // ✅ FIX console undefined
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImportsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // ================= General Code Quality =================
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // ================= TypeScript =================
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // ================= Unused Imports =================
      "unused-imports/no-unused-imports": "warn",

      // ================= Prettier Integration =================
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false,
          tabWidth: 2,
          useTabs: false,
          trailingComma: "es5",
          printWidth: 120,
          endOfLine: "lf",
          jsxSingleQuote: false,
          bracketSameLine: true,
        },
      ],
    },
  },

  // ================= React, Hooks, A11y =================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React JSX
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/no-unknown-property": "error",

      // Accessibility
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
    },
    settings: { react: { version: "detect" } },
  },

  // ================= Jest / Testing =================
  {
    files: ["**/*.test.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
    rules: {},
  },

  // ================= Config files (no type-aware linting) =================
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
        project: undefined,
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
