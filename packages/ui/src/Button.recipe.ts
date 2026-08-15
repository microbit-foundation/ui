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
 * variants. This file holds the brand-independent variant set; a consuming
 * app's preset extends it with app vocabulary (e.g. ml-trainer's
 * `secondary-disabled`, classroom's `active`). Colour reaches a variant two
 * ways, neither of them a per-app fork of the shape: the `button.*` and
 * `languageText` semantic tokens for the app's button idiom, and the `tone`
 * variant's palette for `solid`/`outline`.
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
      // ── The palette shapes ──────────────────────────────────────────────
      // `solid` and `outline` take their colour from the `tone` variant's
      // palette, so one shape serves every meaning an app has (destructive,
      // recording, …). They reference ONLY the four stops the palette
      // contract guarantees — see `tone` below before adding a fifth.
      //
      // Distinct from `primary`/`secondary`, which follow the app's button
      // *idiom* through the `button.*` tokens and are black-on-white in half
      // the family. A palette can't express that, and an idiom button
      // shouldn't change colour with a tone.
      solid: {
        color: "white",
        bg: "colorPalette.500",
        _hover: {
          bg: "colorPalette.600",
          _disabled: { bg: "colorPalette.500" },
        },
        _active: { bg: "colorPalette.700" },
      },
      // 2px to match `secondary`, the family's other outline. The border is
      // the palette's 500 and the label its 600: a 2px boundary needs 3:1
      // and 500 clears it, while 500 as *text* does not reliably read on
      // white. Keeping the border at 500 also keeps a toggle pair coherent
      // — ml-trainer's record button is this outline when off and `solid`
      // when on, and both then show the same red edge.
      //
      // Two further outline shapes are restated per call site in classroom —
      // a neutral outline (1px gray.200, inherited text, gray.50/gray.100
      // hover/press) and an on-colour outline (white 2px + white text over a
      // coloured bar, whiteAlpha hover/press). Neither is a palette of this
      // one, and neither has a second consumer yet; promote when one appears.
      outline: {
        borderWidth: "2px",
        borderColor: "colorPalette.500",
        color: "colorPalette.600",
        bg: "transparent",
        _hover: { borderColor: "colorPalette.600", color: "colorPalette.700" },
        _active: { bg: "colorPalette.50" },
      },
      // The grey filled button (python-editor's zoom/undo pills,
      // data-microbit-org's copy and rating buttons). Deliberately NOT a
      // palette shape: it is a light fill under dark text, and its press stop
      // (350) exists only in the gray ramp — `tone="gray"` on a palette shape
      // would be a different button, and any palette shape reaching for 350
      // would render nothing in every other palette.
      neutral: {
        color: "gray.800",
        bg: "gray.100",
        _hover: { bg: "gray.300", _disabled: { bg: "gray.100" } },
        _active: { bg: "gray.350" },
      },
      // Family-wide variant (every censused app has toolbar-class buttons).
      // No ring override: the bar decides, and a dark one must spread
      // `darkSurface` — an app adopting this variant needs the tag with it.
      toolbar: {
        color: "black",
        bg: "white",
        _hover: { bg: "whiteAlpha.900", _disabled: { bg: "white" } },
        _active: { bg: "whiteAlpha.800" },
      },
    },
    /**
     * The palette behind `solid`/`outline`. Each entry sets Panda's
     * `colorPalette`, which aliases `--colors-color-palette-*` to that ramp's
     * stops; the shapes read the aliases.
     *
     * ── The palette contract ────────────────────────────────────────────
     * The shapes reference 50, 500, 600 and 700, and a tone's palette must
     * define at least those. Prefer a whole ramp: Panda's `colorPalette` key
     * space is the union of every stop name across all colour tokens, so
     * `colorPalette.200` under a palette that has no 200 typechecks, emits
     * `var(--colors-color-palette-200)`, resolves to nothing, and the
     * declaration is dropped — an invisible button, with no error anywhere.
     * A complete palette costs nothing and has nowhere to fall through,
     * which is why `danger` aliases red whole rather than at the four stops
     * in use. `gray`'s private 10/75/350 are why it is not a tone.
     *
     * An allowlist rather than Panda's open `colorPalette` prop: this is the
     * gate where a palette is checked against that contract. An app can add
     * a tone in its own preset if it has vocabulary the family doesn't.
     */
    tone: {
      brand: { colorPalette: "brand" },
      // The destructive *role*, which a brand preset can re-point.
      danger: { colorPalette: "danger" },
      // The ramp itself, for the conventional red that isn't destructive —
      // ml-trainer's record buttons. Distinct from `danger` precisely
      // because it should not follow a brand's idea of an error colour.
      red: { colorPalette: "red" },
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "md",
    // Never absent: a shape with no palette behind it would render its
    // background and border as nothing at all.
    tone: "brand",
  },
});
