/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "styled-system/css";

/**
 * For containers of rendered content (markdown, CMS output, innerHTML)
 * whose anchors are not `Link` components: restores the always-underlined
 * link treatment that the preflight reset strips (see Link.recipe.ts).
 */
export const proseClass = css({
  "& a": {
    textDecoration: "underline",
  },
});
