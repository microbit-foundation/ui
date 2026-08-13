/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { definePreset } from "@pandacss/dev";
import {
  blurs,
  borders,
  breakpoints,
  colors,
  durations,
  easings,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  sizes,
  spacing,
  zIndex,
} from "./base-tokens";
// Config recipes are colocated with the shared-ui components they style; this
// preset registers them so Panda merges them at codegen time.
import { avatar } from "./Avatar.recipe";
import { breadcrumb } from "./Breadcrumb.recipe";
import { button } from "./Button.recipe";
import { card } from "./Card.recipe";
import { checkbox } from "./Checkbox.recipe";
import { radio } from "./Radio.recipe";
import { drawer } from "./Drawer.recipe";
import { gridList } from "./GridList.recipe";
import { heading } from "./Heading.recipe";
import { input } from "./Input.recipe";
import { listBox } from "./ListBox.recipe";
import { numberField } from "./NumberField.recipe";
import { menu } from "./Menu.recipe";
import { select } from "./Select.recipe";
import { slider } from "./Slider.recipe";
import { switchRecipe } from "./Switch.recipe";
import { dialog } from "./Modal.recipe";
import { text } from "./Text.recipe";
import { tooltip } from "./Tooltip.recipe";
import { field } from "./Field.recipe";
import { toast } from "./Toast.recipe";

// The family gray ramp: pure neutrals as the library default. The two
// halves have different jobs and different override rules:
//
// - 10–300 are surface stops (panels, page backdrops, hairlines, subtle
//   fills). Presets may freely override these values — pinning an app's
//   existing surfaces or applying a brand tint — because a few bits of
//   lightness here reads across a whole viewport.
// - 350 is the decorative/state fill stop (~2.1:1): avatar discs, skeleton
//   pulse, pressed fills. Never text or boundaries.
// - 400–900 are ink stops (outlines, placeholders, text) with a contrast
//   contract on white: 400 ≥ 3:1, the accessible form-outline stop
//   (WCAG 1.4.11); 500 ≥ 4.5:1, text-safe secondary (placeholders, muted
//   icons). Presets may re-tint these only luminance-matched — the
//   contrast figures are the contract, hue is free.
//
// Override values, never names: raw var(--colors-gray-*) references and
// paired private presets depend on the names, so a rename is a breaking
// change to both and needs every app and paired preset moved in lockstep
// (as was done when the misnamed darker-than-50 stop `25` became
// `75`). And never override partially in a way that lets a stop fall
// through to a different grey system.
const gray = {
  10: { value: "#fcfcfc" },
  50: { value: "#f9f9f9" },
  75: { value: "#f5f5f5" },
  100: { value: "#f1f1f1" },
  200: { value: "#e7e7e7" },
  300: { value: "#d4d4d4" },
  350: { value: "#b4b4b4" }, // ~2.1:1 — decorative fills only
  400: { value: "#949494" }, // 3.05:1 — accessible outline stop
  500: { value: "#767676" }, // 4.54:1 — text-safe secondary
  600: { value: "#575757" },
  700: { value: "#404040" },
  800: { value: "#262626" },
  900: { value: "#1a1a1a" },
};

/**
 * The base preset: the complete, working micro:bit design system. The base
 * token scales (base-tokens.ts), the micro:bit house style
 * (pill `radii.button`, `outline*` focus shadows, Helvetica fonts, the
 * `toolbar` button variant in Button.recipe.ts, the
 * `languageText`/`toast*Bg`/`statusBarBg` semantic tokens), the shared-ui
 * component recipes, the react-aria condition widening, the `globalCss`
 * defaults, and the `staticCss` that keeps runtime-prop recipe
 * variants generated. Used alone it renders in the OSS default look.
 *
 * ── Brand contract ──────────────────────────────────────────────────────
 * A private brand preset (a sibling repo, e.g. CreateAI) is merged AFTER this
 * one to restyle everything by overriding just these token *values* (never
 * their names — see the CSS-var contract in the README):
 *   - colours: the `brand` and `brand2` ramps (OSS defaults: the blue
 *     ramp / a legacy slate gray). Other ramps a brand tweaks
 *     (teal/purple/pink/…) already exist in the base scales below.
 *   - font: `display` (OSS default: Helvetica; e.g. GT Walsheim privately).
 * The recipes and semantic tokens here reference those, so a brand swap needs
 * no recipe changes. With no private preset, these OSS defaults stand.
 */
export const basePreset = definePreset({
  name: "microbit-ui-base",
  theme: {
    breakpoints,
    keyframes: {
      // Spinner's revolution.
      spin: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
      // Skeleton's pulse, over the pair of custom properties the component
      // sets, so a retinted skeleton animates between its own colours.
      skeletonFade: {
        from: {
          borderColor: "var(--skeleton-start-color)",
          background: "var(--skeleton-start-color)",
        },
        to: {
          borderColor: "var(--skeleton-end-color)",
          background: "var(--skeleton-end-color)",
        },
      },
      // Toast enter/exit, played on the view-transition snapshots (see the
      // ::view-transition rules in globalCss): fade + short slide in,
      // quicker fade + shrink out.
      toastSlideIn: {
        from: { opacity: 0, transform: "translateY(-24px)" },
      },
      toastSlideOut: {
        to: { opacity: 0, transform: "scale(0.85)" },
      },
    },
    tokens: {
      colors: {
        ...colors,
        gray,
        // OSS default brand ramps (see the brand contract above). `brand`
        // aliases the blue ramp; `brand2` is a frozen legacy alias of the
        // slate gray in base-tokens, deliberately decoupled from the neutral
        // `gray` above so ml-trainer's OSS look and `statusBarBg`'s default
        // don't move.
        // Removing the slot is a follow-up needing an ml-trainer lockstep.
        brand: colors.blue,
        brand2: colors.gray,
      },
      spacing,
      sizes,
      fontSizes,
      fontWeights,
      lineHeights,
      letterSpacings,
      zIndex,
      blurs,
      borders,
      durations,
      easings,
      radii: {
        ...radii,
        // Pill button radius (4/4 apps in the family census).
        button: { value: "2rem" },
      },
      shadows: {
        ...shadows,
        // The 4px focus outline shadow, plus dark/light-surface
        // companions. Consumed via the `focusShadow` utility.
        outline: { value: "0 0 0 4px rgba(66, 153, 225, 0.6)" },
        outlineDark: { value: "0 0 0 4px rgba(0, 0, 0, 0.5)" },
        outlineLight: { value: "0 0 0 4px rgba(255, 255, 255, 0.8)" },
      },
      fonts: {
        // Helvetica heading/body (4/4 apps); a brand preset leaves these and
        // overrides only `display` (the marketing font — see the brand
        // contract above).
        heading: { value: "Helvetica, Arial, sans-serif" },
        body: { value: "Helvetica, Arial, sans-serif" },
        mono: {
          value:
            'SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
        },
        // OSS default marketing font (the `marketing` heading variant). No OSS
        // brand display face, so it falls back to the body stack.
        display: { value: "Helvetica, Arial, sans-serif" },
      },
    },
    semanticTokens: {
      colors: {
        // Checked/focus states of form controls: Checkbox/Switch/Radio
        // checked backgrounds and the Input/Select focus border. Semantic
        // so a brand can diverge them from its ramp — e.g. a light
        // brand.500 needing a darker 3:1 focus border.
        controlCheckedBg: { value: "{colors.brand.500}" },
        controlCheckedHoverBg: { value: "{colors.brand.600}" },
        focusBorder: { value: "{colors.brand.500}" },
        // Error/destructive ramp. Destructive button variants,
        // field error states and the error toast; the record* button
        // variants deliberately stay on red.* (recording vocabulary, not
        // danger).
        danger: {
          50: { value: "{colors.red.50}" },
          100: { value: "{colors.red.100}" },
          500: { value: "{colors.red.500}" },
          600: { value: "{colors.red.600}" },
          700: { value: "{colors.red.700}" },
        },
        // The language-dialog cards' text colour (@microbit/ui-patterns'
        // LanguageDialog) follows the primary interactive brand: every
        // consumer resolves it to its `brand` ramp (CreateAI privately to
        // brand.600 with no hover change, python-editor to brand.500/600 —
        // the default; data-microbit-org to black). Semantic tokens so the
        // pattern stays shared and a brand preset overrides only values.
        languageText: { value: "{colors.brand.500}" },
        languageTextHover: { value: "{colors.brand.600}" },
        // The `label`/`subtitle` heading variants' colour (page-title chrome).
        // classroom and data-microbit-org carried byte-identical variants with
        // a hardcoded #cd0365 — the brand deep pink, which is data's
        // `pink.500`; both override this to it. The OSS default follows the
        // languageText precedent: the primary interactive brand.
        headingAccent: { value: "{colors.brand.500}" },
        // The `primary`/`secondary` button variants' colours. Two brand
        // idioms exist in the family: brand-coloured buttons (ml-trainer,
        // python-editor — the defaults below) and a black-on-white system
        // (classroom, data-microbit-org: black solid, black outline, no
        // border colour change on hover but a blackAlpha wash instead).
        // Tokens rather than per-app recipe overrides so both idioms share
        // one recipe — a `variant` fork would be duplicated by every app on
        // the far side of it. `primary`'s text colour stays a literal
        // `white`: every app in the family puts white on a dark solid.
        // `ghost` needs no tokens (black + blackAlpha in all four apps).
        button: {
          primaryBg: { value: "{colors.brand.500}" },
          primaryHoverBg: { value: "{colors.brand.600}" },
          primaryActiveBg: { value: "{colors.brand.700}" },
          secondaryText: { value: "{colors.brand.700}" },
          secondaryBorder: { value: "{colors.brand.500}" },
          secondaryHoverBorder: { value: "{colors.brand.600}" },
          secondaryHoverBg: { value: "transparent" },
          secondaryActiveBorder: { value: "{colors.brand.700}" },
          secondaryActiveBg: { value: "{colors.brand.50}" },
        },
        // Toast status colours (teal for every status except error), shared
        // across the app family.
        toastInfoBg: { value: "{colors.teal.800}" },
        toastSuccessBg: { value: "{colors.teal.800}" },
        toastWarningBg: { value: "{colors.teal.800}" },
        toastErrorBg: { value: "{colors.danger.600}" },
        // The native app's status-bar area colour, shared by the ActionBar
        // and the full-size dialog's safe-area gradient.
        statusBarBg: { value: "{colors.brand2.500}" },
      },
    },
    recipes: {
      button,
      heading,
      input,
      text,
      tooltip,
    },
    slotRecipes: {
      avatar,
      breadcrumb,
      card,
      checkbox,
      dialog,
      drawer,
      field,
      gridList,
      listBox,
      menu,
      numberField,
      radio,
      select,
      slider,
      switchRecipe,
      toast,
    },
  },
  // Global defaults Panda's preflight doesn't cover: body text/background,
  // placeholder colour, kerning/text-rendering (their absence shifts
  // glyphs page-wide) and touch-action. Token references resolve against
  // the merged preset stack, so the values track any brand overrides.
  globalCss: {
    html: {
      textRendering: "optimizeLegibility",
      touchAction: "manipulation",
    },
    body: {
      // No `position: relative` (Chakra had it): it breaks react-aria's
      // overlay positioning — see Tooltip's "In a scrolling page" story.
      minHeight: "100%",
      fontFeatureSettings: '"kern"',
      fontFamily: "body",
      color: "gray.800",
      bg: "white",
      transitionProperty: "background-color",
      transitionDuration: "normal",
      lineHeight: "base",
    },
    "*::placeholder": {
      color: "gray.500",
    },
    // The `* { border-color; word-wrap }` defaults live in ../reset.css,
    // imported into the `reset` layer by consumers' layers.css — NOT here:
    // globalCss emits into the `base` layer, which the legacy-Safari
    // cascade-layer flattening specificity-boosts above runtime-injected
    // CSS (CodeMirror themes) and other app CSS files. Resets must stay in
    // the bottom layer.
    // Panda's preflight doesn't set the pointer cursor on buttons.
    // Recipes' disabled states (cursor: not-allowed) override this from
    // the higher recipes layer.
    "button, [role='button']": {
      cursor: "pointer",
    },
    // Panda's preflight balance-wraps headings; balanced multi-line
    // headings break at different points (mobile/translations), so undo it.
    "h1, h2, h3, h4, h5, h6": {
      textWrap: "wrap",
    },
    // While a full-size dialog is open (the Modal stamps data-fullsize on
    // its overlay), release the scrollbar gutter that react-aria's scroll
    // lock reserves on the root. The reserved strip is scrollbar chrome to
    // hit-testing — elementFromPoint returns null there, so clicks fall
    // through to the root and dismiss the dialog, and controls near the
    // right edge lose part of their target. With the page fully covered,
    // the reflow this causes is invisible. !important: react-aria sets the
    // reservation as a non-important inline style.
    "html:has([data-fullsize])": {
      scrollbarGutter: "auto !important",
    },
    // Toast enter/exit (the ToastQueue wraps updates in
    // document.startViewTransition — see Toast.tsx, which also stamps the
    // scoping class on <html> while its transitions run). Timings: 0.4s
    // fade+slide in, 0.2s fade+shrink out; the
    // stack reflow comes from the default group animation. `(*)` +
    // `:only-child` matches exactly the entering/exiting toast groups: the
    // root snapshot always has both old and new children, and toasts are
    // the only named groups during a toast transition. The snapshot
    // overlay must not eat clicks while a toast animates, hence
    // pointer-events, scoped likewise.
    "html.microbit-ui-toast-transition::view-transition": {
      pointerEvents: "none",
    },
    // `both` fill: the snapshots must hold the keyframes' end states for
    // however long the rest of the transition (e.g. the 0.25s default group
    // animation) outlives them, or they snap back to full size/opacity for
    // the remainder.
    "html.microbit-ui-toast-transition::view-transition-new(*):only-child": {
      animation: "toastSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
    },
    "html.microbit-ui-toast-transition::view-transition-old(*):only-child": {
      animation: "toastSlideOut 0.2s cubic-bezier(0.4, 0, 1, 1) both",
    },
  },
  // shared-ui components forward `variant`/`size`/etc. as runtime props to
  // the recipe functions, so Panda's static analysis can't see which variants
  // are used and would emit no CSS for them. Generate every recipe variant.
  // Lives in the preset (not the consumer's panda.config.ts) so no consumer
  // can silently lose runtime-prop variants.
  staticCss: {
    recipes: {
      // Size is passed responsively at call sites
      // (`size={["md", "lg"]}`), so generate the breakpoint-prefixed variants
      // too — otherwise the class lands on the element with no rule behind it
      // and the button silently falls back to the base size.
      avatar: ["*"],
      button: [{ size: ["*"], responsive: true }, { variant: ["*"] }],
      checkbox: ["*"],
      heading: ["*"],
      card: ["*"],
      // Dialog size is chosen with responsive objects ({ base, md }) passed
      // as a runtime prop, so generate the breakpoint-prefixed variants too.
      dialog: [{ size: ["*"], responsive: true }, { centered: ["*"] }],
      drawer: ["*"],
      field: ["*"],
      gridList: ["*"],
      listBox: ["*"],
      input: ["*"],
      numberField: ["*"],
      radio: ["*"],
      select: ["*"],
      switchRecipe: ["*"],
      text: ["*"],
      tooltip: ["*"],
      // Toast status is chosen at runtime from the toast content.
      toast: ["*"],
    },
  },
  utilities: {
    extend: {
      // The app-wide focus indicator, usually inside `_focusVisible`. Values
      // are the outline* shadow token names. The transparent outline is for
      // forced-colors modes, which strip box-shadows but recolour outlines to
      // a visible system colour. (Named to avoid preset-base's outline-based
      // `focusRing` utility, whose values would break this transform.)
      focusShadow: {
        className: "focus-shadow",
        values: ["outline", "outlineDark", "outlineLight"],
        transform: (value: string, { token }) => ({
          outline: "2px solid transparent",
          outlineOffset: "2px",
          boxShadow: token(`shadows.${value}`),
        }),
      },
    },
  },
  // Widen the interaction conditions so recipe/style objects written with
  // `_hover`/`_active`/`_focusVisible`/`_disabled` also respond to
  // react-aria-components' data attributes, not just native pseudo-classes.
  conditions: {
    extend: {
      hover: "&:is(:hover, [data-hovered])",
      active: "&:is(:active, [data-pressed])",
      focusVisible: "&:is(:focus-visible, [data-focus-visible])",
      disabled:
        "&:is(:disabled, [disabled], [data-disabled], [aria-disabled=true])",
      // High-contrast/forced-palette modes (e.g. Windows High Contrast), which
      // strip author backgrounds and box-shadows.
      forcedColors: "@media (forced-colors: active)",
    },
  },
});

export default basePreset;
