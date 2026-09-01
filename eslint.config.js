import microbit from "@microbit/eslint-config/react";
import storybook from "eslint-plugin-storybook";

export default [
  {
    // Build scripts kept in plain JS.
    ignores: ["bin"],
  },
  ...microbit,
  ...storybook.configs["flat/recommended"],
  {
    // Test fixtures assemble static children arrays where the runtime key
    // warning is not what the tests exercise.
    files: ["**/tests/**"],
    rules: {
      "@eslint-react/no-missing-key": "off",
    },
  },
];
