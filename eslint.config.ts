// {
//   "parser": "@typescript-eslint/parser",
//   "extends": [
//     "eslint:recommended",
//     "plugin:@typescript-eslint/recommended",
//     "prettier"
//   ],
//   "plugins": ["@typescript-eslint", "prettier"],
//   "env": {
//     "es6": true,
//     "browser": true,
//     "node": true
//   },
//   "parserOptions": {
//     "ecmaVersion": "latest",
//     "sourceType": "module"
//   },
//   "rules": {
//     "prettier/prettier": "error",
//     "@typescript-eslint/explicit-function-return-type": "warn",
//     "@typescript-eslint/no-explicit-any": "error",
//     "@typescript-eslint/no-unused-vars": "warn",
//     "@typescript-eslint/no-non-null-assertion": "warn",
//     "@typescript-eslint/no-inferrable-types": "warn",
//     "no-console": "warn",
//     "eqeqeq": ["error", "always"]
//   }
// }

import js from "@eslint/js";
import tsplugin from "@typescript-eslint/eslint-plugin";
import Prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      prettier: Prettier,
      "@typescript-eslint": tsplugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "no-console": "warn",
      eqeqeq: ["error", "always"],
    },
  },
);
