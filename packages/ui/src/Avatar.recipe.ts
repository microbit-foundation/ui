/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Avatar slot recipe — a circle showing an image, the initials of a name, or
 * a generic person glyph, optionally with a badge pinned to one corner.
 *
 * The background and text colour come from `var(--avatar-bg)` and
 * `var(--avatar-color)` rather than being flat values, because the component
 * derives them from the name (see Avatar.tsx) and writes them as inline custom
 * properties. Two reasons, both about letting a call site win with a plain
 * `css={{ bg: …, color: … }}`: an inline *property* would beat any class,
 * where an inline *variable* only feeds this declaration; and both must stay
 * single-class selectors, since a state selector like `&[data-light-bg]`
 * would outrank the call site's utility class on specificity.
 *
 * The `calc(size / 2.5)` font size is resolved per size so an app preset can
 * restate either independently (classroom's avatars are a grade larger).
 *
 * Registered in the base preset (base-preset.ts), which also has the
 * `staticCss` entry that keeps the runtime-prop variants generated.
 */
export const avatar = defineSlotRecipe({
  className: "avatar",
  slots: ["root", "label", "image", "badge"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
      verticalAlign: "top",
      textAlign: "center",
      textTransform: "uppercase",
      fontWeight: "medium",
      borderRadius: "full",
      // The no-name defaults; the name-derived pair arrives inline.
      // gray.350 is the decorative-fill stop — 400+ are reserved for
      // accessible outlines and text (see the ramp in base-preset.ts).
      background: "var(--avatar-bg, token(colors.gray.350))",
      color: "var(--avatar-color, token(colors.white))",
      borderColor: "white",
    },
    label: {
      lineHeight: "1",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "inherit",
    },
    badge: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "full",
      // em-relative, so a badge keeps its proportions at every avatar size.
      borderWidth: "0.2em",
      borderStyle: "solid",
      borderColor: "white",
      // The corner variants pin the badge with logical insets but nudge it
      // out over the edge with a transform, which is physical — so the
      // outward direction is a variable the RTL rule negates. Without it a
      // `start` badge would sit at the right corner and nudge left, i.e.
      // inwards over the avatar.
      // Fallbacks carry a unit: `calc(-1 * 0)` is a number, which is invalid
      // where a length is wanted, and would drop the RTL transform whole.
      transform:
        "translate(var(--avatar-badge-x, 0px), var(--avatar-badge-y, 0px))",
      _rtl: {
        transform:
          "translate(calc(-1 * var(--avatar-badge-x, 0px)), var(--avatar-badge-y, 0px))",
      },
    },
  },
  variants: {
    // The container size, and the `calc(size / 2.5)` font size kept as a
    // calc over the same token so both track a preset that rescales `sizes`
    // (the dense preset does, by 0.88).
    //
    // The font size lands on the root *and* the label. They are separate
    // declarations so an app can
    // move one without the other: the root's is the em basis for a badge,
    // the label's is how big the initials are, and the two are not always
    // the same wish.
    size: {
      "2xs": {
        root: {
          width: "4",
          height: "4",
          fontSize: "calc(token(sizes.4) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.4) / 2.5)" },
      },
      xs: {
        root: {
          width: "6",
          height: "6",
          fontSize: "calc(token(sizes.6) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.6) / 2.5)" },
      },
      sm: {
        root: {
          width: "8",
          height: "8",
          fontSize: "calc(token(sizes.8) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.8) / 2.5)" },
      },
      md: {
        root: {
          width: "12",
          height: "12",
          fontSize: "calc(token(sizes.12) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.12) / 2.5)" },
      },
      lg: {
        root: {
          width: "16",
          height: "16",
          fontSize: "calc(token(sizes.16) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.16) / 2.5)" },
      },
      xl: {
        root: {
          width: "24",
          height: "24",
          fontSize: "calc(token(sizes.24) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.24) / 2.5)" },
      },
      "2xl": {
        root: {
          width: "32",
          height: "32",
          fontSize: "calc(token(sizes.32) / 2.5)",
        },
        label: { fontSize: "calc(token(sizes.32) / 2.5)" },
      },
    },
    /** Which corner the badge sits in. */
    placement: {
      "top-start": {
        badge: {
          top: "0",
          insetStart: "0",
          "--avatar-badge-x": "-25%",
          "--avatar-badge-y": "-25%",
        },
      },
      "top-end": {
        badge: {
          top: "0",
          insetEnd: "0",
          "--avatar-badge-x": "25%",
          "--avatar-badge-y": "-25%",
        },
      },
      "bottom-start": {
        badge: {
          bottom: "0",
          insetStart: "0",
          "--avatar-badge-x": "-25%",
          "--avatar-badge-y": "25%",
        },
      },
      "bottom-end": {
        badge: {
          bottom: "0",
          insetEnd: "0",
          "--avatar-badge-x": "25%",
          "--avatar-badge-y": "25%",
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
    placement: "bottom-end",
  },
});
