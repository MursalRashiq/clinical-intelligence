import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import type { Linter } from "eslint";



const config: Linter.FlatConfig[] = [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    ignores: ["eslint.config.ts"],
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    },
  },
  {
    files: ["eslint.config.ts"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
];

export default config;