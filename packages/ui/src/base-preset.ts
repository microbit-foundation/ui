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
import { field } from "./TextField.recipe";
import { toast } from "./Toast.recipe";

// The family gray ramp: pure neutrals (r=g=b throughout) as the OSS default
// of the per-app tinted ramps (see docs/gray-ramp.md). Stops keep Chakra's
// names, and 50–300 match Chakra's *luminance* exactly — big panel surfaces
// are made of these, and even a few bits of darkening at the near-white end
// is visible across a viewport (classroom's teacher page caught an earlier
// draft that darkened 50 for tidier numbering). Departures from Chakra:
//   - 400 is re-graded darker to 3.05:1 on white, the accessible
//     form-outline stop; Chakra's 400 (2.26:1) sat uselessly between
//     roles and the ramp had nothing in the 3:1–4.5:1 band.
//   - 500 is #767676 (4.54:1) rather than Chakra's 4.0:1, so
//     placeholders and secondary text pass AA.
// The sub-100 stops are the family's *panel tints*, named by position:
// 10 (lighter than 50) and 75 (between 50 and 100 — renamed from a
// historical "25"; see docs/gray-ramp.md).
const gray = {
  10: { value: "#fcfcfc" },
  50: { value: "#f9f9f9" },
  75: { value: "#f5f5f5" },
  100: { value: "#f1f1f1" },
  200: { value: "#e7e7e7" },
  300: { value: "#d4d4d4" },
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
 * `language`/`toolbar` button variants in Button.recipe.ts, the
 * `languageText`/`toast*Bg`/`statusBarBg` semantic tokens), the shared-ui
 * component recipes, the react-aria condition widening, the Chakra-reset
 * parity `globalCss`, and the `staticCss` that keeps runtime-prop recipe
 * variants generated. Used alone it renders in the OSS default look.
 *
 * ── Brand contract ──────────────────────────────────────────────────────
 * A private brand preset (a sibling repo, e.g. CreateAI) is merged AFTER this
 * one to restyle everything by overriding just these token *values* (never
 * their names — see the CSS-var contract in the README):
 *   - colours: the `brand` ramp (OSS default: Chakra blue). Other ramps a
 *     brand tweaks (teal/purple/pink/…) already exist in the Chakra scales
 *     below. (There is deliberately no `brand2`: a second accent is an app
 *     decision, not a library slot — ml-trainer, its only user, defines it
 *     in its app preset.)
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
    },
    tokens: {
      colors: {
        ...colors,
        gray,
        // OSS default brand ramp (see the brand contract above): Chakra
        // blue. (Chakra's slate gray is gone from base-tokens.ts — the
        // family gray above is the one grey system.)
        brand: colors.blue,
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
        // Chakra's outline shadow widened to 4px, plus dark/light-surface
        // companions. Consumed via the `focusShadow` utility.
        outline: { value: "0 0 0 4px rgba(66, 153, 225, 0.6)" },
        outlineDark: { value: "0 0 0 4px rgba(0, 0, 0, 0.5)" },
        outlineLight: { value: "0 0 0 4px rgba(255, 255, 255, 0.8)" },
      },
      fonts: {
        // Helvetica heading/body (4/4 apps); a brand preset leaves these and
        // overrides only `display` (the marketing font — see the brand
        // contract above). `mono` is Chakra's default stack.
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
        // Checked/focus states of form controls (Chakra's default blue
        // colorScheme). Checkbox/Switch checked backgrounds, Input focus
        // border, and the Slider/ProgressBar fills (the last two are
        // near-dead defaults - current call sites override them).
        controlCheckedBg: { value: "{colors.blue.500}" },
        controlCheckedHoverBg: { value: "{colors.blue.600}" },
        focusBorder: { value: "{colors.blue.500}" },
        sliderFilledTrack: { value: "{colors.blue.500}" },
        progressFilledTrack: { value: "{colors.blue.500}" },
        // Error/destructive ramp (Chakra red). Destructive button variants,
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
        // The `language` button variant's text colour follows the primary
        // interactive brand: every consumer resolves it to its `brand` ramp
        // (CreateAI privately to brand.600 with no hover change,
        // python-editor to brand.500/600 — the default). Semantic tokens so
        // the recipe stays shared and a brand preset overrides only values.
        // (Was brand2.* — the grey ml-trainer OSS Chakra look — but both
        // apps' final values sit on their primary brand, so the default
        // follows; OSS language buttons are brand blue.)
        languageText: { value: "{colors.brand.500}" },
        languageTextHover: { value: "{colors.brand.600}" },
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
        // Toast status colours: the Chakra-era toast Alert restyle (teal for
        // every status except error) shared across the app family.
        toastInfoBg: { value: "{colors.teal.800}" },
        toastSuccessBg: { value: "{colors.teal.800}" },
        toastWarningBg: { value: "{colors.teal.800}" },
        toastErrorBg: { value: "{colors.danger.600}" },
        // The native app's status-bar area colour, shared by the apps'
        // ActionBars and the full-size dialog's safe-area gradient. The
        // default is a deliberately bland grey — it only ever renders on a
        // notched device, and every native app re-points it (classroom to
        // black, ml-trainer to its brand2).
        statusBarBg: { value: "{colors.gray.500}" },
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
  // What ChakraProvider used to inject and Panda's preflight doesn't cover:
  // the theme's styles.global (body text/background defaults, global
  // border/placeholder colours) plus the parts of Chakra's CSS reset that
  // Panda's has no equivalent for — kerning/text-rendering (their absence
  // shifts glyphs page-wide), word-wrap and touch-action. Token references
  // resolve against the merged preset stack, so the values track any brand
  // overrides exactly as they did under Chakra's runtime theme.
  globalCss: {
    html: {
      textRendering: "optimizeLegibility",
      touchAction: "manipulation",
    },
    body: {
      position: "relative",
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
    // The `* { border-color; word-wrap }` Chakra-reset parity lives in
    // ../reset.css, imported into the `reset` layer by consumers'
    // layers.css — NOT here: globalCss emits into the `base` layer, which
    // the legacy-Safari cascade-layer flattening specificity-boosts above
    // runtime-injected CSS (CodeMirror themes) and other app CSS files.
    // Resets must stay at the bottom (playbook gotcha #28).
    // Panda's preflight, unlike Chakra's reset, doesn't set the pointer
    // cursor on buttons. Recipes' disabled states (cursor: not-allowed)
    // override this from the higher recipes layer.
    "button, [role='button']": {
      cursor: "pointer",
    },
    // Panda's preflight balance-wraps headings; Chakra didn't, and balanced
    // multi-line headings break at different points (mobile/translations).
    "h1, h2, h3, h4, h5, h6": {
      textWrap: "wrap",
    },
  },
  // shared-ui components forward `variant`/`size`/etc. as runtime props to
  // the recipe functions, so Panda's static analysis can't see which variants
  // are used and would emit no CSS for them. Generate every recipe variant.
  // Lives in the preset (not the consumer's panda.config.ts) so no consumer
  // can silently lose runtime-prop variants.
  staticCss: {
    recipes: {
      // Size is passed responsively at call sites ported from Chakra's
      // `size={["md", "lg"]}`, so generate the breakpoint-prefixed variants
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
      gridList: ["*"],
      listBox: ["*"],
      input: ["*"],
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
  // Widen the interaction conditions so the Chakra-shaped recipe/style objects
  // (`_hover`/`_active`/`_focusVisible`/`_disabled`) also respond to
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
