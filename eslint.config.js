import microbit from "@microbit/eslint-config/react";

export default [
  {
    // Build scripts kept in plain JS.
    ignores: ["bin"],
  },
  ...microbit,
  {
    // Storybook `render` functions use hooks; they are components in practice
    // but the rule only accepts component-cased names.
    files: ["**/*.stories.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    // Test fixtures assemble static children arrays where the runtime key
    // warning is not what the tests exercise.
    files: ["**/tests/**"],
    rules: {
      "react/jsx-key": "off",
    },
  },
];
