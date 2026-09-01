import microbit from "@microbit/eslint-config/react";

export default [
  {
    // Build scripts kept in plain JS.
    ignores: ["bin"],
  },
  ...microbit,
  {
    // Test fixtures assemble static children arrays where the runtime key
    // warning is not what the tests exercise.
    files: ["**/tests/**"],
    rules: {
      "@eslint-react/no-missing-key": "off",
    },
  },
];
