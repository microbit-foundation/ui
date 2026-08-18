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
 * variants. Colour reaches a variant either through the `button.*` semantic
 * tokens (the app's button idiom) or through `tone`, never through a per-app
 * fork of a shape.
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
        color: "fg.link",
        fontWeight: "normal",
        bg: "transparent",
        _hover: {
          textDecoration: "underline",
        },
      },
      // Colours come from the `button.*` component tokens so the family's
      // two button idioms (brand-coloured vs black-on-white) share this
      // recipe — see the token block in base-preset.ts.
      secondary: {
        borderWidth: "2px",
        borderColor: "button.secondary.border",
        color: "button.secondary.fg",
        bg: "transparent",
        _hover: {
          borderColor: "button.secondary.borderHover",
          bg: "button.secondary.bgHover",
        },
        _active: {
          bg: "button.secondary.bgActive",
          borderColor: "button.secondary.borderActive",
        },
      },
      ghost: {
        color: "fg.strong",
        bg: "transparent",
        _hover: { bg: "fill.transparentHover" },
        _active: { bg: "fill.transparentActive" },
      },
      // Base-only styling: a transparent, colour-inheriting button. Used for
      // the action-bar icon-button menu triggers (settings/help), which supply
      // their own colour and shape via instance styles.
      plain: {
        bg: "transparent",
        color: "inherit",
      },
      primary: {
        color: "fg.onEmphasis",
        bg: "button.primary.bg",
        _hover: {
          bg: "button.primary.bgHover",
          _disabled: { bg: "button.primary.bg" },
        },
        _active: { bg: "button.primary.bgActive" },
      },
      // `solid`/`outline` are coloured by `tone`, and reference only the
      // stops it guarantees (50/500/600/700). They are not `primary`/
      // `secondary` in another colour: those follow the app's button idiom,
      // which is black-on-white in half the family and so can't be a palette.
      solid: {
        color: "fg.onEmphasis",
        bg: "colorPalette.500",
        _hover: {
          bg: "colorPalette.600",
          _disabled: { bg: "colorPalette.500" },
        },
        _active: { bg: "colorPalette.700" },
      },
      // Border at 500 (a boundary needs only 3:1) so a `solid`/`outline`
      // toggle pair shows the same edge either way; the label needs 600.
      //
      // Classroom restates two other outlines per call site — a neutral 1px
      // grey one and a white-on-colour one. Promote either if a second
      // consumer appears.
      outline: {
        borderWidth: "2px",
        borderColor: "colorPalette.500",
        color: "colorPalette.600",
        bg: "transparent",
        _hover: { borderColor: "colorPalette.600", color: "colorPalette.700" },
        _active: { bg: "colorPalette.50" },
      },
      // Not a palette shape: a light fill under dark text is a different
      // button from `solid`, and 350 exists in no other ramp.
      neutral: {
        color: "fg.default",
        bg: "fill.neutral",
        _hover: { bg: "fill.neutralHover", _disabled: { bg: "fill.neutral" } },
        _active: { bg: "fill.neutralActive" },
      },
      // Family-wide variant (every censused app has toolbar-class buttons).
      // No ring override: the bar decides, and a dark one must spread
      // `darkSurface` — an app adopting this variant needs the tag with it.
      toolbar: {
        color: "buttonToolbar.fg",
        bg: "buttonToolbar.bg",
        _hover: {
          bg: "buttonToolbar.bgHover",
          _disabled: { bg: "buttonToolbar.bg" },
        },
        _active: { bg: "buttonToolbar.bgActive" },
      },
    },
    /**
     * The palette behind `solid`/`outline`. An allowlist rather than Panda's
     * open `colorPalette` prop: if a shape reads a stop the palette doesn't
     * define, the button renders as nothing at all, with no error anywhere
     * (docs/hints.md). This is where a palette is vetted, and a tone should
     * alias a whole ramp so it has nowhere to fall through. Apps may add
     * their own.
     */
    tone: {
      brand: { colorPalette: "brand" },
      // The destructive role, which a brand preset can re-point.
      danger: { colorPalette: "danger" },
      // Conventional red that isn't destructive (record buttons), so
      // deliberately not following a brand's error colour.
      red: { colorPalette: "red" },
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "md",
    // Never absent: a shape with no palette renders nothing.
    tone: "brand",
  },
});
