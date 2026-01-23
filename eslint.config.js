import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
      globals: {
        document: "readonly",
        window: "readonly",
        HTMLDivElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLButtonElement: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        crypto: "readonly",
        requestAnimationFrame: "readonly",
        performance: "readonly",
        Blob: "readonly",
        URL: "readonly",
        PerformanceMeasure: "readonly",
        navigator: "readonly",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["node_modules/**", "dist/**"],
  },
];
