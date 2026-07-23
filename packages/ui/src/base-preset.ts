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
import { button } from "./Button.recipe";
import { card } from "./Card.recipe";
import { checkbox } from "./Checkbox.recipe";
import { drawer } from "./Drawer.recipe";
import { heading } from "./Heading.recipe";
import { input } from "./Input.recipe";
import { menu } from "./Menu.recipe";
import { slider } from "./Slider.recipe";
import { switchRecipe } from "./Switch.recipe";
import { dialog } from "./Modal.recipe";
import { field } from "./TextField.recipe";
import { toast } from "./Toast.recipe";

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
 *   - colours: the `brand` and `brand2` ramps (OSS defaults: Chakra
 *     blue / Chakra's unmodified gray). Other ramps a brand tweaks
 *     (teal/purple/pink/…) already exist in the Chakra scales below.
 *   - font: `display` (OSS default: Helvetica; e.g. GT Walsheim privately).
 * The recipes and semantic tokens here reference those, so a brand swap needs
 * no recipe changes. With no private preset, these OSS defaults stand.
 */
export const basePreset = definePreset({
  name: "microbit-ui-base",
  theme: {
    breakpoints,
    keyframes: {
      // Spinner's revolution (the only keyframe a shared-ui component uses).
      spin: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
    },
    tokens: {
      colors: {
        ...colors,
        gray: {
          ...colors.gray,
          // Very light grays the family's designs use below Chakra's 50.
          10: { value: "#fcfcfc" },
          25: { value: "#f5f5f5" },
        },
        // OSS default brand ramps (see the brand contract above). `brand`
        // aliases Chakra blue; `brand2` Chakra's *unmodified* gray (not the
        // `gray` above, whose 10/25 additions are lighter — getting this
        // wrong once made card text near-invisible).
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
        // The `language` button variant's text colour is the one place the
        // brands diverge structurally (OSS uses the grey brand2 ramp, the
        // CreateAI brand its blue brand ramp with no hover change). Driven by
        // these semantic tokens so the recipe stays shared and a brand preset
        // overrides only the values.
        languageText: { value: "{colors.brand2.500}" },
        languageTextHover: { value: "{colors.brand2.600}" },
        // Toast status colours: the Chakra-era toast Alert restyle (teal for
        // every status except error) shared across the app family.
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
    },
    slotRecipes: {
      card,
      checkbox,
      dialog,
      drawer,
      field,
      menu,
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
    "*, *::before, *::after": {
      borderColor: "gray.200",
      wordWrap: "break-word",
    },
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
      button: ["*"],
      heading: ["*"],
      card: ["*"],
      // Dialog size is chosen with responsive objects ({ base, md }) passed
      // as a runtime prop, so generate the breakpoint-prefixed variants too.
      dialog: [{ size: ["*"], responsive: true }, { centered: ["*"] }],
      drawer: ["*"],
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
