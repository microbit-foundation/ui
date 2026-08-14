/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defineSlotRecipe } from "@pandacss/dev";

/**
 * Menu slot recipe. `content` is the dropdown card (react-aria-components'
 * Popover), `list` the RAC Menu, `item` a MenuItem, `icon` the leading-icon
 * wrapper.
 *
 * A config slot recipe (rather than an atomic `sva`) for consistency with
 * `dialog` and so presets can override it later if brands diverge.
 * No variants, so it needs no `staticCss` entry.
 *
 * Registered in the base preset (base-preset.ts).
 */
export const menu = defineSlotRecipe({
  className: "menu",
  slots: [
    "content",
    "list",
    "item",
    "icon",
    "label",
    "divider",
    "group",
    "groupTitle",
    "itemIndicator",
  ],
  base: {
    content: {
      bg: "white",
      color: "inherit",
      minWidth: "3xs",
      py: "2",
      // `popover` (1500), not `dropdown` (1000): a RAC Popover always portals
      // to the body, so a menu opened from inside a Modal (zIndex `modal`,
      // 1400) escapes the modal's stacking context and would paint behind it.
      // Nothing else lives between 1400 and the toast/tooltip layer.
      zIndex: "popover",
      borderRadius: "md",
      borderWidth: "1px",
      borderColor: "gray.200",
      boxShadow: "sm",
      // Fade/scale enter/exit. RAC toggles data-entering/data-exiting on the
      // Popover and waits for the transition before unmount.
      transformOrigin: "top",
      opacity: 1,
      transform: "scale(1)",
      transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
      "&[data-entering]": { opacity: 0, transform: "scale(0.95)" },
      "&[data-exiting]": { opacity: 0, transform: "scale(0.95)" },
      _motionReduce: { transition: "none" },
    },
    list: {
      outline: "none",
    },
    item: {
      display: "flex",
      alignItems: "center",
      py: "1.5",
      px: "3",
      cursor: "pointer",
      color: "inherit",
      textDecoration: "none",
      outline: "none",
      // data-focused is RAC's active item, either modality. The highlight
      // is focus indication: no transition (it snaps with the ring, which
      // keyboard nav adds; inset, the rows being full-bleed).
      "&[data-focused]": { bg: "gray.100" },
      "&[data-focus-visible]": { focusRing: "outlineInset" },
      "&[data-pressed]": { bg: "gray.200" },
      "&[data-disabled]": { opacity: 0.4, cursor: "not-allowed" },
    },
    label: {
      // A flex:1 wrapper around an icon-item's children, so block children
      // (e.g. two stacked <Text>s) lay out vertically rather than as flex-row
      // siblings of the icon.
      flex: "1",
    },
    icon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginEnd: "0.75rem",
      // Glyphs shrink to 0.8em; items passing an explicitly sized icon
      // (e.g. h/w) override this.
      fontSize: "0.8em",
    },
    divider: {
      border: 0,
      borderBottom: "1px solid",
      borderColor: "gray.200",
      my: "2",
      opacity: 0.6,
    },
    group: {},
    // Title for a menu group or option group.
    groupTitle: {
      display: "block",
      mx: "4",
      my: "2",
      fontWeight: "semibold",
      fontSize: "sm",
    },
    // Check glyph slot for MenuItemOption: space always reserved, visible
    // only on the selected item (RAC sets data-selected on it).
    itemIndicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginEnd: "0.75rem",
      fontSize: "0.8em",
      opacity: 0,
      "[data-selected] &": { opacity: 1 },
    },
  },
});
