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
//   contract on white: 400 ≥ 3:1, the floor for boundaries that identify
//   a control (checkbox-family boxes; fields rest lighter — see the input
//   recipe); 500 ≥ 4.5:1, text-safe secondary. Presets may re-tint these
//   only luminance-matched — the contrast figures are the contract, hue
//   is free.
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

// The family red, on the gray ramp's ladder — it is the conventional colour
// for errors and recording, not a brand colour, so it can be graded rather
// than negotiated. 400 was already exactly gray's 3:1 and stays verbatim,
// anchoring the hue and saturation the darker stops hold while their
// lightness solves for gray's ratio. The washes have no contract and keep
// their values.
const red = {
  50: { value: "#FFF5F5" },
  100: { value: "#FED7D7" },
  200: { value: "#FEB2B2" },
  300: { value: "#FC8181" },
  400: { value: "#F56565" }, // 3.03:1
  500: { value: "#e22b2b" }, // 4.55:1 — the white-text fill stop
  600: { value: "#ac1818" },
  700: { value: "#811212" },
  800: { value: "#4f0b0b" },
  900: { value: "#380808" },
};

/**
 * The base preset: the complete, working micro:bit design system. The base
 * token scales (base-tokens.ts), the micro:bit house style
 * (pill `radii.button`, the `focusRing` utility/token pair, Helvetica
 * fonts, the
 * `toolbar` button variant in Button.recipe.ts, the
 * `fg`/`surface`/`fill`/`border` role tokens), the shared-ui
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
        red,
        // OSS default brand ramps (see the brand contract above). `brand`
        // aliases the blue ramp; `brand2` is a frozen legacy alias of the
        // slate gray in base-tokens, deliberately decoupled from the neutral
        // `gray` above so ml-trainer's OSS look and `surface.statusBar`'s default
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
        // ── Role tokens ────────────────────────────────────────────────
        // Recipes and apps consume these, not ramp stops. Grouped by the
        // property they belong to, so a foreground role can't be used as
        // a background: `fg` (text and icons), `surface` (the background
        // of a container), `fill` (the background of a control sitting
        // ON a surface), `border`. The surface/fill split is why the two
        // grey state ladders below are both right — rows on a raised
        // surface hover to 50, a grey button fill hovers to 300.
        // Rationale and the systems this follows: ui-private
        // docs/role-tokens.md.
        //
        // Several roles share a value today. That is the point: a dark
        // mode is a second value per role here, and nothing else.

        // Text and icons. No separate icon group — icons take
        // currentColor everywhere in this library.
        fg: {
          default: { value: "{colors.gray.800}" },
          // Full black, for the buttons that want more weight than body
          // text on a light fill (`ghost`, `toolbar`). Flips on a tagged
          // dark surface, which is what lets `ghost` work on dark chrome
          // without a per-app variant. Condition object — an override must
          // keep the `{ base, _onDark }` shape or silently lose the flip.
          strong: {
            value: { base: "{colors.black}", _onDark: "{colors.white}" },
          },
          muted: { value: "{colors.gray.600}" },
          // Three roles at one value, three jobs: tertiary content, an
          // empty field, an unavailable control. A dark mode and any
          // future contrast work will want them apart.
          subtle: { value: "{colors.gray.500}" },
          placeholder: { value: "{colors.gray.500}" },
          disabled: { value: "{colors.gray.500}" },
          // On a solid `fill.accent`/status fill.
          onEmphasis: { value: "{colors.white}" },
          // On `surface.inverse`.
          onInverse: { value: "{colors.whiteAlpha.900}" },
          // Decorative brand accent: the `label`/`subtitle` heading
          // variants. classroom and data-microbit-org carried
          // byte-identical variants with a hardcoded #cd0365 — the brand
          // deep pink, which is data's `pink.500`; both override this.
          accent: { value: "{colors.brand.500}" },
          link: { value: "{colors.brand.600}" },
          danger: { value: "{colors.danger.500}" },
        },

        // Backgrounds of containers, and the state fills that go over
        // them. The state fills are opaque greys, so they are only valid
        // over `canvas`/`raised` — over anything coloured, use the
        // translucent `fill.transparent*` pair.
        surface: {
          canvas: { value: "{colors.white}" },
          raised: { value: "{colors.white}" },
          // Filled panels punched into a surface: Code, Kbd, the
          // ProgressBar track, the Skeleton base.
          inset: { value: "{colors.gray.100}" },
          inverse: { value: "{colors.gray.700}" },
          overlay: { value: "{colors.blackAlpha.600}" },
          // Two hover weights, not an inconsistency. Large row targets
          // (ListBox, GridList) take the light one; small targets whose
          // hover has to read at a glance — an option in an overlay, a
          // NumberField stepper — take `highlight`, which is also the
          // keyboard highlight in a Menu or Select. `selected` shares
          // `highlight`'s value and differs in job: it persists.
          hover: { value: "{colors.gray.50}" },
          highlight: { value: "{colors.gray.100}" },
          selected: { value: "{colors.gray.100}" },
          active: { value: "{colors.gray.200}" },
          // Toast statuses. Three roles at one value is deliberate: the
          // family has decided not to differentiate info/success/warning,
          // and that decision belongs where an app can undo it.
          info: { value: "{colors.teal.800}" },
          success: { value: "{colors.teal.800}" },
          warning: { value: "{colors.teal.800}" },
          // 500, the text-safe stop, rather than following the teal
          // toasts' 800: white on it is 4.55:1 and an error toast should
          // read as red.
          danger: { value: "{colors.danger.500}" },
          // The native app's status-bar area, shared by the ActionBar and
          // the full-size dialog's safe-area gradient.
          statusBar: { value: "{colors.brand2.500}" },
        },

        // Backgrounds of controls sitting on a surface.
        fill: {
          // Checked Checkbox/Switch/Radio, the Slider range, the
          // ProgressBar bar. Brand-coloured in every app including the
          // black-on-white ones — this is not the button idiom.
          accent: { value: "{colors.brand.500}" },
          accentHover: { value: "{colors.brand.600}" },
          // The grey filled button. Not `accent` in another palette: a
          // light fill under dark text is a different button, and 350
          // exists in no other ramp.
          neutral: { value: "{colors.gray.100}" },
          neutralHover: { value: "{colors.gray.300}" },
          neutralActive: { value: "{colors.gray.350}" },
          // Washes for controls with no fill of their own (`ghost`).
          // Translucent because they must work over an unknown
          // background; the only place this library uses translucency
          // for state.
          // Alphas are not mirrored: a white wash reads weaker than a
          // black one at equal alpha, so the on-dark pair is two ramp
          // steps up (0.08/0.16 against 0.04/0.06). 0.08 is also
          // Material's hover figure.
          transparentHover: {
            value: {
              base: "{colors.blackAlpha.50}",
              _onDark: "{colors.whiteAlpha.200}",
            },
          },
          transparentActive: {
            value: {
              base: "{colors.blackAlpha.100}",
              _onDark: "{colors.whiteAlpha.300}",
            },
          },
          // The resting background of a control that contains something:
          // the Checkbox/Radio box, an Input, a Select trigger. White like
          // `surface.raised` today and not the same thing — one is a
          // container, the other is a control on it.
          control: { value: "{colors.white}" },
          disabled: { value: "{colors.gray.100}" },
          // A disabled control that is also checked, which needs to stay
          // distinguishable from a disabled unchecked one.
          disabledEmphasis: { value: "{colors.gray.200}" },
          track: { value: "{colors.gray.200}" },
          trackEmphasis: { value: "{colors.gray.300}" },
          knob: { value: "{colors.white}" },
          // Darker than `fill.disabled`: a knob has to stay visible
          // against the track it sits on.
          knobDisabled: { value: "{colors.gray.300}" },
          // gray.350, the ramp's documented decorative/state fill stop
          // (~2.1:1): the Avatar disc, the Skeleton pulse. Never text or
          // boundaries.
          decorative: { value: "{colors.gray.350}" },
        },

        border: {
          // Surface edges: Card, popover, Menu separators, Divider, Kbd.
          default: { value: "{colors.gray.200}" },
          // Fields rest lighter than the 3:1 control stop — they are
          // identified by their label (a11y-positions.md №1).
          control: { value: "{colors.gray.300}" },
          controlHover: { value: "{colors.gray.500}" },
          // The 3:1 floor, for boundaries that ARE the control's
          // identifier: the Checkbox/Radio box.
          controlEmphasis: { value: "{colors.gray.400}" },
          // A disabled control's border matches its fill, so the box reads
          // as one flat shape rather than an outlined empty one.
          disabled: { value: "{colors.gray.100}" },
          disabledEmphasis: { value: "{colors.gray.200}" },
          danger: { value: "{colors.danger.500}" },
          // A ring separating a control from a busy background: the
          // Avatar.
          onEmphasis: { value: "{colors.white}" },
        },

        // ── Component tokens ───────────────────────────────────────────
        // Not roles: groups whose *shape*, not just values, is an app
        // choice. Primer and Carbon both keep button tokens separate from
        // their role layer for the same reason.

        // The `primary`/`secondary` button variants. Two brand idioms
        // exist in the family: brand-coloured buttons (ml-trainer,
        // python-editor — the defaults below) and a black-on-white system
        // (classroom, data-microbit-org: black solid, black outline, no
        // border colour change on hover but a blackAlpha wash instead).
        // The two differ in structure, not just hue — one darkens the
        // border and keeps the background clear, the other holds the
        // border and washes the background — so no palette expresses
        // both, and these stay tokens rather than a `tone`.
        // `primary`'s text colour is `fg.onEmphasis`: every app in the
        // family puts white on a dark solid. `ghost` needs no tokens
        // (black + blackAlpha in all four apps).
        button: {
          primary: {
            bg: { value: "{colors.brand.500}" },
            bgHover: { value: "{colors.brand.600}" },
            bgActive: { value: "{colors.brand.700}" },
          },
          secondary: {
            fg: { value: "{colors.brand.700}" },
            border: { value: "{colors.brand.500}" },
            borderHover: { value: "{colors.brand.600}" },
            bgHover: { value: "transparent" },
            borderActive: { value: "{colors.brand.700}" },
            bgActive: { value: "{colors.brand.50}" },
          },
        },

        // The `toolbar` button: a white pill that lives ON dark chrome, so
        // it must NOT follow the dark-surface tag — its own fill is light
        // whatever it sits on, and a flipping `fg` role would render it
        // white on white. Component tokens rather than `fill.*`/`fg.*` for
        // exactly that reason: anything that paints against the surface
        // has to opt out of the flips.
        buttonToolbar: {
          fg: { value: "{colors.black}" },
          bg: { value: "{colors.white}" },
          bgHover: { value: "{colors.whiteAlpha.900}" },
          bgActive: { value: "{colors.whiteAlpha.800}" },
        },

        // The language-dialog cards' name text (@microbit/ui-patterns'
        // LanguageDialog). The brand colour, so the name reads as the
        // choice being offered rather than as body copy.
        //
        // A component token rather than a role, because consumers really
        // do diverge and along their own idiom, not this component's:
        // classroom, python-editor and ml-trainer take the default;
        // CreateAI flattens to brand.600; data-microbit-org uses black,
        // which is its emphasis colour throughout (black buttons, black
        // outlines) while its actual links stay blue. So this must not
        // fold into `fg.link` — data would lose that distinction.
        //
        // `fgHover` is the one part with no live justification: it dates
        // from when this was a text link with no background, and the card
        // now hovers its own background (`surface.highlight`), which is
        // why both overriding presets set it equal to `fg`. Kept because
        // dropping it is a visible change in the three apps still on the
        // default. See ui-private docs/role-tokens.md.
        languageDialog: {
          fg: { value: "{colors.brand.500}" },
          fgHover: { value: "{colors.brand.600}" },
        },

        // The close buttons on the Modal and the Toast. A step stronger
        // than `fill.transparent*` — a close button has to read on a
        // white dialog and on a dark toast alike, which is also why this
        // is the pair that wants the on-dark flip (docs/role-tokens.md).
        closeButton: {
          bgHover: {
            value: {
              base: "{colors.blackAlpha.100}",
              _onDark: "{colors.whiteAlpha.300}",
            },
          },
          bgActive: {
            value: {
              base: "{colors.blackAlpha.200}",
              _onDark: "{colors.whiteAlpha.400}",
            },
          },
        },

        // Focused form-control border, any modality: the dark brand stop
        // (all-ink read flat next to the ink ring). Flips white under the
        // dark-surface tag, like `focusRing`.
        // Both flips are condition objects, and a merge replaces a token
        // value wholesale: an override must keep the `{ base, _onDark }`
        // shape or silently lose the flip.
        focusBorder: {
          value: { base: "{colors.brand.600}", _onDark: "{colors.white}" },
        },
        // The focus ring colour: ink, or white inside `data-surface="dark"`
        // (the `onDark` condition). The var inherits — tag the bar, cover
        // its controls; portalled overlays escape with the DOM. Dark
        // surfaces MUST tag (ink is near-invisible there). Opaque
        // deliberately: translucent rings washed out (classroom #780).
        // Both tag states: the Button "Variants" story.
        focusRing: {
          value: { base: "{colors.gray.900}", _onDark: "{colors.white}" },
        },
        // Error/destructive ramp: field error states, the error toast, and
        // the `danger` button tone. Aliased whole, not just at the stops in
        // use, so a tone has nowhere to fall through (Button.recipe.ts).
        danger: {
          50: { value: "{colors.red.50}" },
          100: { value: "{colors.red.100}" },
          200: { value: "{colors.red.200}" },
          300: { value: "{colors.red.300}" },
          400: { value: "{colors.red.400}" },
          500: { value: "{colors.red.500}" },
          600: { value: "{colors.red.600}" },
          700: { value: "{colors.red.700}" },
          800: { value: "{colors.red.800}" },
          900: { value: "{colors.red.900}" },
        },
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
      // Alias preset-base's ring plumbing to our colour, so a stray use
      // of its focusVisibleRing/focusRing* utilities renders in our
      // ink rather than #005FCC. Still don't use them: un-gated focus
      // selector, and this alias resolves on <html> (no tag awareness).
      "--global-color-focus-ring": "var(--colors-focus-ring)",
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
    // The colour of the seams an attached ButtonGroup draws (ButtonGroup.tsx).
    // Transparent, so a variant with no border of its own divides by letting
    // the surface show through rather than by a line in the text colour.
    //
    // From `base`, so a variant that does bring a border colours its seams
    // from `recipes` (as the cursor rule above is overridden). Longhands
    // because Panda resolves `transparent` to a token, and the logical
    // *shorthand* with a var() value is the one Safari 14.x drops — the
    // postcss-legacy-safari shim does not cover the border ones.
    "[data-attached] > *": {
      borderInlineStartColor: "transparent",
      borderInlineEndColor: "transparent",
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
      // `tone` generates as its own rule, not crossed with `variant`: it
      // only assigns the palette custom properties a shape reads.
      button: [
        { size: ["*"], responsive: true },
        { variant: ["*"] },
        { tone: ["*"] },
      ],
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
      // The app-wide focus indicator, usually inside `_focusVisible`: a
      // 2px `focusRing`-coloured outline at 2px offset — the surface shows
      // through the gap, and call sites never pick a ring per background.
      // A real outline, so forced-colors modes keep a ring; longhands
      // because Panda resolves tokens per-property. Thickness/contrast
      // rationale: ui-private docs/a11y-positions.md. Shadows
      // preset-base's `focusRing`: our transform replaces theirs, but the
      // values arrays union, so its outside/inside/mixed/none typecheck
      // here. `none` is honoured — the alternative is a permanent un-gated
      // ring; the other three fall through to the standard one. Don't use
      // them.
      focusRing: {
        className: "focus-ring",
        // `outlineInset` draws the ring just inside — for full-bleed rows
        // whose outward ring would overhang their popover.
        values: ["outline", "outlineInset"],
        transform: (value: string, { token }) =>
          value === "none"
            ? { outlineStyle: "none" }
            : {
                outlineStyle: "solid",
                outlineWidth: "2px",
                outlineColor: token("colors.focusRing"),
                outlineOffset: value === "outlineInset" ? "-2px" : "2px",
              },
      },
      // preset-base's remaining ring plumbing sets --focus-ring-* custom
      // properties only its own utilities read. Repointed at the outline
      // longhands ours draws with, rather than left as no-ops that read
      // like working knobs.
      focusRingWidth: {
        className: "focus-ring-w",
        values: "borderWidths",
        transform: (value: string) => ({ outlineWidth: value }),
      },
      focusRingOffset: {
        className: "focus-ring-o",
        values: "spacing",
        transform: (value: string) => ({ outlineOffset: value }),
      },
      focusRingStyle: {
        className: "focus-ring-s",
        values: "borderStyles",
        // `outlineStyle` is a keyword union, hence the cast.
        transform: (value: string) => ({ outlineStyle: value as "solid" }),
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
      // Native :focus-visible counts only on elements RAC doesn't manage:
      // react-aria's modality tracking is stricter than the browser's
      // (e.g. focus restored from a menu after mouse-only use).
      focusVisible:
        "&:is(:focus-visible:not([data-rac]), [data-focus-visible])",
      disabled:
        "&:is(:disabled, [disabled], [data-disabled], [aria-disabled=true])",
      // A dark-by-design surface (spread the exported `darkSurface` onto
      // the bar element); scopes the focusRing/focusBorder flips. Never
      // theme-relative: a future dark mode flips untagged defaults via
      // token conditions, not markup.
      onDark: '[data-surface="dark"] &',
      // High-contrast/forced-palette modes (e.g. Windows High Contrast), which
      // strip author backgrounds and box-shadows.
      forcedColors: "@media (forced-colors: active)",
    },
  },
});

export default basePreset;
