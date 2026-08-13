/*
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * Generates Panda's CSS during the Storybook build via the PostCSS plugin
 * (it injects into the cascade-layer declaration in .storybook/layers.css and
 * emits the styled-system/ codegen; `npm run panda` still runs codegen up
 * front so tsc has the helpers). This Storybook targets modern browsers, so it
 * deliberately does NOT include the legacy-browser plugins consuming apps add
 * (see the README "Legacy browser support" section).
 */
module.exports = {
  plugins: {
    "@pandacss/dev/postcss": {},
  },
};
