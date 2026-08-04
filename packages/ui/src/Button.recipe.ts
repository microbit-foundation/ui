/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineRecipe } from "@pandacss/dev";

// Chakra's transition.property.common, inlined (Panda has no transitionProperty
// token category). Matches Chakra's Button base transition.
const transitionCommon =
  "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform";

/**
 * Button recipe — Chakra's default Button base + sizes, with this app's
 * borderRadius (`button` = 2rem) and variant set ported from
 * `components/button.ts`. Interaction conditions (`_hover`/`_active`/
 * `_disabled`/`_focusVisible`) are widened in the preset to also match
 * react-aria-components' data attributes, so these Chakra-shaped variant
 * objects work unchanged on RAC's <Button>.
 *
 * A config recipe (not a component cva): styles land in the `recipes` layer so
 * call sites can override with plain style props, and presets extend the
 * variants. This file holds the brand-independent variant set — the core
 * Chakra variants plus the family-wide `language`/`toolbar` variants; a
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
      focusShadow: "outline",
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
      // Chakra's unstyled reset + this app's border-radius removal.
      unstyled: {
        bg: "none",
        color: "inherit",
        display: "inline",
        lineHeight: "inherit",
        m: "0",
        p: "0",
        borderRadius: "unset",
      },
      // Chakra's link layout (no padding/height) + this app's colours.
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
      // Chakra had no `plain` variant, so `variant="plain"` fell through to
      // base-only styling: a transparent, colour-inheriting button. Used for the
      // action-bar icon-button menu triggers (settings/help), which supply their
      // own colour and shape via instance styles.
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
      // 600/700, matching what python-editor's Chakra outline + red
      // colorScheme resolved to. (Extracted from ml-trainer at 500/600, but
      // its one warning button tolerates the darkening; python-editor's
      // "Reset project" was visibly lighter than its Chakra self.)
      // NOTE (2026-08-02, from classroom): two Chakra `outline` shapes have
      // no home here and are currently restated per call site in that app —
      // worth considering as variants once a second consumer wants them.
      //   - a neutral outline (transparent, 1px gray.200, inherited text,
      //     gray.50/gray.100 hover/press): Chakra's default-colorScheme
      //     `outline`, and python-editor's *default* variant per the
      //     playbook's cross-app vocabulary, so likely already a 2-app shape.
      //   - an on-colour outline (white 2px + white text over a coloured bar,
      //     whiteAlpha hover/press): Chakra's `outline` + `whiteAlpha`.
      // `warning` below is the *destructive* outline and is not a substitute
      // for either; `warningSolid` did map exactly onto Chakra solid+red.
      warning: {
        borderWidth: "2px",
        borderColor: "danger.600",
        color: "danger.600",
        bg: "transparent",
        _hover: { borderColor: "danger.700", color: "danger.700" },
        _active: { bg: "danger.50" },
      },
      // Chakra's built-in solid + red colorScheme (destructive confirm
      // buttons). Same values as `record` today, but a separate variant so
      // recording UI and destructive actions can diverge - hence danger
      // tokens here, red.* literals there.
      warningSolid: {
        color: "white",
        bg: "danger.500",
        _hover: { bg: "danger.600", _disabled: { bg: "danger.500" } },
        _active: { bg: "danger.700" },
      },
      // Family-wide variants (every censused app has language- and
      // toolbar-class buttons).
      toolbar: {
        color: "black",
        bg: "white",
        _hover: { bg: "whiteAlpha.900", _disabled: { bg: "white" } },
        _active: { bg: "whiteAlpha.800" },
        _focusVisible: { focusShadow: "outlineDark" },
      },
      language: {
        borderWidth: "2px",
        borderColor: "gray.200",
        color: "languageText",
        // `hoverTint`, not a gray stop: hover is a highlight, and on the
        // neutral ramp an achromatic wash reads as drab where the old
        // blue-cast gray.100 read as a tint. The semantic token keeps that
        // cool highlight (and lets a brand tint it toward its own hue)
        // without it living in the gray vocabulary.
        _hover: { color: "languageTextHover", bg: "hoverTint" },
      },
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "md",
  },
});
