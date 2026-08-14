/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

// The common transition-property list, inlined (Panda has no
// transitionProperty token category). No box-shadow: focus indication
// must never fade in.
const transitionCommon =
  "background-color, border-color, color, fill, stroke, opacity, transform";

/**
 * Button recipe — the family button base + sizes, with the house
 * borderRadius (`button` = 2rem). Interaction conditions (`_hover`/`_active`/
 * `_disabled`/`_focusVisible`) are widened in the preset to also match
 * react-aria-components' data attributes, so these variant objects work
 * unchanged on RAC's <Button>.
 *
 * A config recipe (not a component cva): styles land in the `recipes` layer so
 * call sites can override with plain style props, and presets extend the
 * variants. This file holds the brand-independent variant set — the core
 * variants plus the family-wide `language`/`toolbar` variants; a
 * consuming app's preset extends it with app vocabulary (e.g. ml-trainer's
 * `led`/`record*`/`secondary-disabled`). Brand divergence within a variant is
 * token-driven (see the `button.*` and `languageText` semantic tokens).
 *
 * Registered in the base preset (base-preset.ts).
 */
export const button = defineRecipe({
  className: "btn",
  jsx: ["Button", "IconButton"],
  base: {
    lineHeight: "1.2",
    borderRadius: "button",
    fontWeight: "semibold",
    transitionProperty: transitionCommon,
    transitionDuration: "normal",
    display: "inline-flex",
    appearance: "none",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    position: "relative",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    outline: "none",
    _focusVisible: {
      focusRing: "outline",
    },
    _disabled: {
      opacity: 0.4,
      cursor: "not-allowed",
      boxShadow: "none",
    },
    _hover: {
      _disabled: {
        bg: "initial",
      },
    },
  },
  variants: {
    size: {
      lg: { h: "12", minW: "12", fontSize: "lg", px: "6" },
      md: { h: "10", minW: "10", fontSize: "md", px: "4" },
      sm: { h: "8", minW: "8", fontSize: "sm", px: "3" },
      xs: { h: "6", minW: "6", fontSize: "xs", px: "2" },
    },
    variant: {
      // A full reset: the button renders as plain inline content.
      unstyled: {
        bg: "none",
        color: "inherit",
        display: "inline",
        lineHeight: "inherit",
        m: "0",
        p: "0",
        borderRadius: "unset",
      },
      // Link-shaped button: no padding/height, underline on hover.
      link: {
        padding: 0,
        height: "auto",
        lineHeight: "normal",
        verticalAlign: "baseline",
        borderWidth: "0",
        color: "brand.600",
        fontWeight: "normal",
        bg: "transparent",
        _hover: {
          textDecoration: "underline",
        },
      },
      // Colours come from the `button.*` semantic tokens so the family's two
      // button idioms (brand-coloured vs black-on-white) share this recipe —
      // see the token block in base-preset.ts.
      secondary: {
        borderWidth: "2px",
        borderColor: "button.secondaryBorder",
        color: "button.secondaryText",
        bg: "transparent",
        _hover: {
          borderColor: "button.secondaryHoverBorder",
          bg: "button.secondaryHoverBg",
        },
        _active: {
          bg: "button.secondaryActiveBg",
          borderColor: "button.secondaryActiveBorder",
        },
      },
      ghost: {
        color: "black",
        bg: "transparent",
        _hover: { bg: "blackAlpha.50" },
        _active: { bg: "blackAlpha.100" },
      },
      // Base-only styling: a transparent, colour-inheriting button. Used for
      // the action-bar icon-button menu triggers (settings/help), which supply
      // their own colour and shape via instance styles.
      plain: {
        bg: "transparent",
        color: "inherit",
      },
      primary: {
        color: "white",
        bg: "button.primaryBg",
        _hover: {
          bg: "button.primaryHoverBg",
          _disabled: { bg: "button.primaryBg" },
        },
        _active: { bg: "button.primaryActiveBg" },
      },
      // The *destructive* outline (text darker than 500 for contrast).
      // Two other outline shapes are currently restated per call site in
      // classroom — a neutral outline (1px gray.200, inherited text,
      // gray.50/gray.100 hover/press) and an on-colour outline (white 2px +
      // white text over a coloured bar, whiteAlpha hover/press) — worth
      // considering as variants if a second consumer wants them.
      warning: {
        borderWidth: "2px",
        borderColor: "danger.600",
        color: "danger.600",
        bg: "transparent",
        _hover: { borderColor: "danger.700", color: "danger.700" },
        _active: { bg: "danger.50" },
      },
      // The destructive solid (confirm buttons). Same values as ml-trainer's
      // `record` today, but a separate variant so recording UI and
      // destructive actions can diverge - hence danger tokens here, red.*
      // literals there.
      warningSolid: {
        color: "white",
        bg: "danger.500",
        _hover: { bg: "danger.600", _disabled: { bg: "danger.500" } },
        _active: { bg: "danger.700" },
      },
      // Family-wide variant (every censused app has toolbar-class buttons).
      toolbar: {
        color: "black",
        bg: "white",
        _hover: { bg: "whiteAlpha.900", _disabled: { bg: "white" } },
        _active: { bg: "whiteAlpha.800" },
      },
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "md",
  },
});
