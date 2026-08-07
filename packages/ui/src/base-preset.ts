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
// (as was done when Chakra's misnamed darker-than-50 stop `25` became
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
      // Toast enter/exit, matching Chakra v2's toastMotionVariants for
      // position="top": a 24px drop while fading in, and a fade-and-shrink
      // out with no travel. `toastIn` runs on the toast itself (Toast.recipe)
      // and `toastOut` on its ::view-transition snapshot (globalCss below) —
      // see those two for why they differ.
      toastIn: {
        from: { opacity: 0, translate: "0 -24px" },
      },
      toastOut: {
        to: { opacity: 0, scale: "0.85" },
      },
    },
    tokens: {
      colors: {
        ...colors,
        gray,
        // OSS default brand ramps (see the brand contract above). `brand`
        // aliases Chakra blue; `brand2` stays Chakra's slate gray — a frozen
        // legacy alias, deliberately decoupled from the neutral `gray` above
        // so ml-trainer's OSS look and `statusBarBg`'s default don't move.
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
    // ── Toast exit ────────────────────────────────────────────────────────
    // Global because ::view-transition-* are document-root pseudo-elements,
    // not descendants of the toast. Toast.tsx runs closing updates inside
    // document.startViewTransition() and names each toast; the recipe tags
    // them with `view-transition-class: toast` so this rule can select them
    // without knowing the generated names.
    //
    // The exit is the one part that has to come from a snapshot: RAC's
    // UNSTABLE_Toast exposes no exiting state and its region unmounts the
    // node the moment the toast closes, so there is nothing left to animate.
    // The old snapshot outlives the unmount, which is the only way to get an
    // exit without pulling in a motion library. The entrance and the reflow
    // of the toasts around it both animate the live elements instead — see
    // Toast.recipe.ts and Toast.tsx's useToastReflow.
    //
    // :only-child means "this toast was removed" — an old snapshot with no
    // new one. A toast that survives the update has both, so it skips this
    // and just morphs to its new position.
    "::view-transition-old(.toast):only-child": {
      animationName: "toastOut",
      animationDuration: "normal",
      animationTimingFunction: "ease-in",
      animationFillMode: "forwards",
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
