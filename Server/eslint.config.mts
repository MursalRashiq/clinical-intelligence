import js from "@eslint/js";
import tseslint from "typescript-eslint";
import type { Linter } from "eslint";

const config: Linter.FlatConfig[] = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default config;