# Chakra → @microbit/ui migration playbook

How to migrate a micro:bit web app from Chakra UI v2 to
react-aria-components (RAC) + Panda CSS via `@microbit/ui`, with minimal
visual impact.

This is the distilled method from ml-trainer's migration (July 2026), the
first of the family and the one that _built_ the library while migrating.
Apps migrating now have a simpler job: they **consume** `@microbit/ui`
rather than building it — the preset stack, recipes, tokens, staticCss,
globalCss reset parity and a11y work all come with the package.

Each migrating app keeps its own `RAC-MIGRATION.md`-style status doc (the
per-session handover log); this playbook holds the shared method. **When a
migration teaches something new, PR it back into this doc** — the gotcha
catalog grew throughout ml-trainer's run and will keep growing. When a
migration completes, its status doc retires: everything transferable folds
into this doc and the doc is deleted (full histories live in each repo's
git history). ml-trainer's and python-editor's are both retired
(2026-07-30); their remaining app-local follow-ups moved to the owner's
tracking and each repo's `AGENTS.md` operational notes.

## The kit

- `bin/diff-chakra-themes.mjs` — resolved-theme differ: diffs the app's OSS
  vs private Chakra themes and (once Panda presets exist) cross-checks that
  the preset pair encodes the same delta. Run from the app repo.
- `bin/unlayer-panda.mjs` + `bin/panda-dev.mjs` — coexistence tooling (see
  step 3); the app deletes its wiring at the kill-switch.
- `bin/gen-chakra-tokens.mjs` — snapshots Chakra v2 default scales in Panda
  token format; audit aid only (`base-tokens.ts` is hand-maintained — do not
  overwrite it). Delete once the family migration is done.
- The fidelity harness pattern (see "Fidelity harness") — copy
  **python-editor's** `bin/fidelity.mjs` + `src/e2e/fidelity.spec.ts` as
  starting points (the newer generation: adds `--baseline-only`/
  `--compare-only` halves for paired-package runs and an HTTPS_PROXY
  passthrough for sandboxed environments; ml-trainer's was the original).
- The consumption setup itself: [`packages/ui/README.md`](../packages/ui/README.md)
  (preset stack, `styled-system` alias, cascade layers, PostCSS wiring,
  react-intl, legacy-Safari support, the CSS-variable contract, runtime
  `token()`).

## The sequence

Each step gates the next; porting within step 4 parallelises freely.

### 0. Census (done for all four apps)

Inventory before touching code: grep `@chakra-ui/react` imports and tally
component usage against the library surface; count files forwarding
`BoxProps`-style props through plain wrappers (gotcha #9's hazard class —
budget an explicit `css`-prop conversion sweep); find third-party styling
seams (static vendor stylesheets → `vendor` layer; runtime CSS-in-JS like
react-select's Emotion → replace, it can't be layered); find tokens consumed
outside React (CodeMirror/xterm CSS vars, `useToken`); note toast call-site
positions/variants and any imperative dialog layers. The four census results
are in the family roadmap below and the app status docs.

### 1. Resolved-theme diff and semantic-token pre-work

Where the app has an OSS/private theme split, run
`node ../ui/bin/diff-chakra-themes.mjs` from the app repo and classify every
divergence. The goal: **brand divergence becomes token values, never
structure**. Colour-ramp deltas map onto the base preset's brand tokens;
structural component-config extensions in the private theme (variant
additions, per-status recolours, gradients) should be converged onto
semantic tokens _while still on Chakra_ — this pre-work is independently
shippable and shrinks the migration. Changing the OSS theme is acceptable
where it simplifies (agreed in principle; scope per component). Semantic
tokens that already exist in the base preset: `languageText*`, `toast*Bg`,
`statusBarBg`, `danger.*`, `controlCheckedBg`, `focusBorder`,
`sliderFilledTrack`, `progressFilledTrack`. Rerun the differ after any theme
or preset change while Chakra remains.

### 2. Foundation: Panda + preset stack + layers

Follow the package README's "App-side installation" exactly: preset stack
(`@pandacss/preset-base` → `@microbit/ui/base-preset` → app preset →
private brand preset, `eject: true`), package source in `include`,
`styled-system` alias in tsconfig + bundler, PostCSS plugin, `layers.css`
with the `vendor` layer, `IntlProvider`/`ToastProvider`. Differences during
coexistence only:

- `preflight: false` — Chakra's global reset is still active; Panda's
  preflight arrives at the kill-switch.
- CSS via `panda cssgen --outfile src/styled-system.css` + unlayering (step 3) instead of the PostCSS/layers.css injection, which is also adopted at
  the kill-switch.

The private brand preset lives in the app's existing private theme package
(a plain object export, no `@pandacss/dev` dep — see
`ml-trainer-microbit`'s `./panda-preset` entry) and changes in lockstep
with the app throughout; branch-publish and pin per the app's existing
theme-package mechanism. After changing a linked/external preset,
regenerate clean (`rm -rf styled-system && npm run panda`) and restart the
dev server — incremental codegen does not detect external preset changes.

### 3. Coexistence

Chakra and Panda run side by side while components port one by one.
Emotion's styles are unlayered, and unlayered CSS beats every layered rule
(gotcha #1), so strip Panda's layers until Chakra is gone:

```json
"panda": "panda codegen && panda cssgen --outfile src/styled-system.css && node ../ui/bin/unlayer-panda.mjs",
"panda:watch": "node ../ui/bin/panda-dev.mjs"
```

Coexistence is still the right shape even though the library now exists —
not because components need building (they don't), but because the swap is
not mechanical: layout moves from Chakra components to Panda patterns,
every non-literal style prop fails _silently_ (gotcha #9 — no error, just
missing styles, caught only by measuring), and each app needs some
components the library doesn't have yet (built in the library in parallel,
per the roadmap policy). Incremental porting keeps the verification loop
per-screen, where those silent failures are findable; a big-bang flip
produces one giant diff whose fidelity failures can't be bisected. What
_does_ change with the library in place is the granularity: port
**area-by-area** (a screen, a dialog family, the app chrome) rather than
ml-trainer's primitive-by-primitive, and expect a much shorter coexistence
period. Verify each ported area against the live branded deployment
(see "Visual comparison workflow") — the OSS default theme is washed-out
grey and hides real issues. After porting a file, grep it for style props
whose value is not a literal (gotcha #9) and remove it from any Panda
`exclude` list (gotcha #10).

### 4. Animations

Chakra apps animate via Emotion `keyframes` and framer-motion. The path:
keyframes move into the app preset (Panda emits every preset keyframe
unconditionally, so keyframes referenced only from runtime inline styles
are safe); runtime-parameterised keyframes become static keyframes over CSS
custom properties set as inline styles per instance; transition components
map to library primitives (`Slide`; Collapse/Fade are planned — see
roadmap). Compare animations against a same-repo Chakra build (stash
compare), not the live deployment, if live runs an older release.

### 5. Kill-switch

Flip the app fully onto the library in one change:

- Remove `ChakraProvider`; drop the `chakraTheme` field from the deployment
  config (both OSS and private packages — lockstep publish).
- **Diff the app's Chakra `styles.global` against the base preset's
  `globalCss`** and carry anything app-specific into the app preset. The
  base preset already carries Chakra-reset behaviours Panda's preflight
  lacks (kern, `optimizeLegibility`, `touch-action: manipulation`,
  `word-wrap`, button cursor, body basics) — verified page-wide-kerning
  identical in ml-trainer.
- Set `preflight: true`; switch CSS generation to the PostCSS/layers.css
  form; delete the cssgen/unlayer wiring; import any vendor stylesheets
  into the `vendor` layer (gotcha #1).
- Delete the Chakra theme files and deps (Chakra, Emotion, framer-motion).
- Watch for `::selection` (gotcha #16) and cursor/focus-order/selection
  behaviours — **screenshots can't see them; check by hand**.

### 6. Fidelity, both sides

Run the fidelity harness against the pre-flip commit; where a brand split
exists, run it branded _and_ OSS. Cross-boundary runs need paired
sibling-package versions — the baseline resolves the _current_ private dist
through the shared node_modules, so rebuild the private package at the
matching old commit for the baseline half. Worked method (python-editor,
2026-07-30; ml-trainer's archive has the original):

1. Private repo: detach at its pre-flip pair commit (the one just before
   its own kill-switch lockstep change) and rebuild `dist/`. Its
   node_modules may lack the since-removed Chakra deps —
   `npm i --no-save --ignore-scripts` them at the old lockfile's versions.
2. App repo: `npm i --no-save` the Chakra deps the kill-switch dropped
   (exact pre-flip lockfile versions) so the baseline worktree's imports
   resolve. Re-create the private-package symlink if the install pruned it.
3. `fidelity.mjs --baseline-only <pre-flip-ref>`.
4. Restore both repos (`git checkout` + rebuild private; plain
   `npm install` in the app; symlink again), then `--compare-only`.
5. OSS side: remove the private symlink for _both_ halves and repeat — no
   private pairing needed.

Both python-editor sides came back pixel-identical across 29 states after
one real find (gotcha #22) — the harness pays for itself.

## Fidelity harness

Screenshot-diffs a list of app states between a baseline ref (temp detached
worktree, node_modules symlinked, own Panda regen, dev server on a second
port) and the working tree, via a dedicated Playwright project. ml-trainer's
`bin/fidelity.mjs` + `src/e2e/fidelity.spec.ts` are the reference
implementation (~43 states). What made it reliable:

- **Determinism requires stubbing in-page randomness** via
  `context.addInitScript`: seed `Math.random`, and make
  `crypto.getRandomValues`/`randomUUID` write a **monotonic per-call prefix**
  into the leading bytes so uuid sort order == creation order regardless of
  async interleaving under load (seeding alone is not enough; IndexedDB key
  order can drive visible order). Use the `reducedMotion` context option to
  pause CSS animations; mask genuinely dynamic canvases (and for other apps:
  CodeMirror, xterm, simulator/embed iframes, plotly).
- `expect.soft` for screenshots so one diff doesn't hide later states.
- Cold dev servers flake on first-visit compiles: generous timeout plus one
  retry (the retry hits a warm server).
- Give each server its own Vite cache dir (`VITE_CACHE_DIR`) — the
  worktree's default cache resolves through the node_modules symlink and
  cross-contaminates the other side's dep optimisation.
- The spec always runs from the working tree (only the app server differs),
  so locator changes never invalidate baselines — but app changes that
  rename UI strings the spec relies on need the spec updated in the same
  tree.
- Keep it on-demand, not CI-gating: image baselines are font-rendering
  sensitive. If CI-gating later, use the pinned Playwright container.
- Run the servers on the app's **regular dev port**: CMS CORS allowlists
  (Sanity) only permit the known origin — on any other port docs content
  silently fails and the app renders its error state (python-editor's
  first harness runs failed this way). The two servers run sequentially,
  so sharing the port is fine.
- Start the servers with the env the **deployed** app has. python-editor
  needed `VITE_FOUNDATION_BUILD=true` or the consent framework never
  loads, cookie consent never initialises, and the welcome dialog can't
  open — an unreachable state, not a diff.
- Coexistence-era baselines run the coexistence panda scripts, which may
  shell out to `../ui/bin/*` — give the temp worktree a sibling `ui`
  symlink.
- Spec-writing: every test must request the fixture that performs the app
  navigation (a `{ page }`-only test sits on `about:blank` and times out
  confusingly); cap workers modestly (each page boots the whole app —
  language-server workers included — against a cold-compiling dev
  server); drive states the app actually reaches (e.g. python-editor's
  Reset only confirms on a dirty project; a clean project fires a toast
  instead).

## Visual comparison workflow (per-screen, during porting)

Drive the local branded preview (`npm run build && npm run preview`) and
the live deployment through an _identical_ scripted flow with headless
Playwright; eyeball the screenshot pairs. Throwaway scripts parameterised
on `(baseUrl, outPrefix)`:

- Pre-seed the cookie-consent cookie rather than clicking the banner.
- Headless Chrome negotiates en-US: match text with locale-agnostic regexes
  (`/colou?r/`) and check the app's actual strings, not guesses.
- Reach real states, not landing pages: create data via the UI, open
  menus/dialogs, focus tooltips, resize for tablet/mobile.
- Beyond screenshots, `page.evaluate` probes settle what pixels can't:
  computed styles, element sizes, `document.activeElement`, canvas
  `getImageData` painted-pixel counts. When local and live disagree, probe
  _both_ and diff numbers.
- Watch `pageerror`/console — a blank screenshot usually means a crash or a
  suspended tree, not a style bug.

Process rules learned the hard way:

- Run the full e2e suite only on a stable tree: editing source or
  regenerating Panda output mid-run invalidates modules and produces bogus
  timeouts. A new react-aria entry-point import triggers a one-off dep
  re-optimisation — expect the first run after to be flaky-slow.
- Rerun a failing spec in isolation before suspecting the migration; some
  suites have known load-sensitive flakes.
- The per-screen loop catches real bugs constantly — don't skip it.

## Gotcha catalog (READ before porting)

Numbering is stable — ml-trainer's doc, commit messages and reviews
reference these by number. #1–#16 are from ml-trainer's migration, #17–#18
from the library extraction.

1. **CSS layer conflict (the big one).** Unlayered CSS always beats layered
   CSS regardless of specificity. During coexistence Chakra/Emotion are
   unlayered — hence `bin/unlayer-panda.mjs`. After the kill-switch the rule
   applies to **third-party stylesheets**: any unlayered vendor CSS beats
   every Panda rule (Swiper's `.swiper-slide { width: 100% }` collapsed
   ml-trainer's carousels). Import vendor stylesheets into the `vendor`
   cascade layer (`@import "..." layer(vendor)`), which `layers.css` orders
   between `reset` and `base` so vendor CSS beats the preflight but loses to
   app styling. Runtime CSS-in-JS (react-select's Emotion) cannot be
   layered — replace the component instead.
2. **RAC interaction states.** The base preset widens Panda's `hover`/
   `active`/`focusVisible`/`disabled` conditions to also match RAC's
   `data-*` attributes, so Chakra-shaped `_hover`/`_active` style objects
   work unchanged on RAC.
3. **`staticCss` for recipe variants.** Components forward `variant`/`size`
   as runtime props, invisible to Panda's static analysis. The base preset
   carries `staticCss` for library recipes; if an **app preset** adds
   recipes or variants selected at runtime, it must extend `staticCss` in
   the preset too (never only in `panda.config.ts` — a consumer that drops
   it silently loses variants; this migration's signature failure class).
4. **Responsive recipe variants must be symmetric.** Panda applies the
   base-breakpoint variant's CSS unconditionally; if `full` sets more props
   than `4xl`, they leak into desktop. Every non-full dialog size restates
   the box props so the larger breakpoint fully overrides `full`.
5. **Know exactly which ramps the app's theme overrode.** ml-trainer's OSS
   `brand2` is Chakra's _unmodified_ gray, not the locally overridden
   `gray` — conflating them made card text near-invisible. Check ramp
   provenance token-by-token (the differ helps).
6. **OSS vs private divergence → semantic tokens.** Structural forks
   (variant colours, fonts, gradients) are driven by semantic tokens the
   private preset overrides (`languageText*`, the `display` font,
   `statusBarBg`), keeping recipes shared. Recipe extension is the escape
   hatch, not the plan.
7. **Icons inherit `currentColor`.** Don't pass `fill` to react-icons (it
   overrides their default `fill="currentColor"` → black). `Icon`/
   `CloseIcon` set `fill: currentColor` in CSS.
8. **Atomic overrides: same-property conflicts across separate `css()`
   calls race on stylesheet order** — cx'ing a base class with an override
   class does NOT mean the override wins; the winner is whichever atomic
   rule is emitted later. Merge base + overrides into a _single_
   `css(base, cssProp)` call so conflicts resolve at merge time. Related:
   longhand beats shorthand across calls; and a border shorthand plus
   separate `borderColor` in one object is order-dependent — use
   width/style longhands with `borderColor`.
9. **Styles must be literals at the JSX/`css()` site.** Panda's extractor
   only reads `css` prop object literals and `css()` call literals where
   they appear — not objects returned from helper functions, not computed
   values (`rowSpan={n + 1}`, ``w={`${x}px`}``, ``w={`calc(...)`}``),
   not style props forwarded through a _plain_ wrapper component. It fails
   silently: classes are applied but no CSS exists, and a coincidental
   identical class from another call site can mask the miss — verify
   against the generated CSS, not the rendered page. What works: same-file
   consts, ternaries of literals, literal arithmetic, custom-named
   object-literal JSX props, and style props on `styled()`-factory
   components (cross-file). Fixes: wrap shared styling in a component with
   an inline `css` literal; give wrappers a `css` prop instead of
   forwarding style props; prefer recipe variants for dimensions (generated
   via `staticCss`, extraction-independent); use inline `style` (with
   runtime `token()` lookups) for data-driven values. After porting a
   file, grep it for non-literal style props. The `BoxProps`-forwarding
   count in each census is this gotcha's per-app budget.
10. **Removing Chakra/Emotion from a file isn't enough — also remove it
    from `panda.config.ts`'s `exclude` list**, or Panda silently skips
    extraction for the whole file (classes applied, no rules generated).
11. **Panda's `AspectRatio` pattern positions its child via a `&>*`
    selector that a still-Chakra child's own `position` style beats**
    (Emotion injects later at equal specificity). Symptom: the `::before`
    padding spacer stacks above the child. Use the native `aspectRatio`
    CSS property instead — arguably the better permanent form anyway.
12. **RAC popovers unmount on close** (Chakra kept menu lists mounted), so
    a hidden file input must live _outside_ a menu or its change event is
    dropped mid-pick — render it as a sibling and call it via ref.
13. **RAC popovers have `role="dialog"`** (menus included, lingering
    briefly with `data-exiting` while animating out), so a bare Playwright
    `getByRole("dialog")` can hit strict-mode ambiguity when a dialog opens
    from a menu. Scope modal lookups to `<section>` (see ml-trainer's
    `modalDialog()` helper) — modals render on a section; popovers are divs.
14. **`<Focusable>` stamps `tabIndex=0` on its child** (unless
    `excludeFromTabOrder`), so wrapping a container holding a real
    `<button>` creates a second tab stop. When the child manages its own
    focus/open state, skip `Focusable` and anchor the overlay with an
    explicit `triggerRef` (the library `Tooltip` supports this).
15. **react-aria's focus defaults replace Chakra-era hacks — don't port
    them.** RAC focuses the dialog element itself on open and restores
    focus to the trigger on close, so initial-focus and restore-focus
    workarounds should be dropped, not ported. Also: usePress cancels
    presses outside the button's bounding rect, so Chakra's
    LinkOverlay-over-Button pattern needs a plain `<button>` +
    `position: static` — encapsulated in `LinkOverlayButton`.
16. **Panda's preflight styles `::selection`** (Chakra's reset didn't), and
    native selection painting cannot be restored by CSS in every engine
    (`revert` works in Chromium only; elsewhere selections turn invisible).
    Live with the preflight's faint blue and override per-surface where
    illegible via `_selection`.
17. **Panda extracts utility-named props with literal values from ANY
    capitalized JSX component** (partially contradicting #9's
    wrapper-forwarding observation — extraction is per-prop-name, not
    per-component). A custom prop named like a utility (`content`) emits a
    broken CSS rule; avoid utility names for non-style props.
18. **An `include` glob that matches nothing fails silently**, and recipe
    styling still works via preset `staticCss`, so a wrong package-source
    path shows up only as broken non-recipe styling. In npm workspaces the
    hoisted package isn't under the app's `node_modules` — check the
    resolved path.

19. **Dev-linking `@microbit/ui` as source gives you two Reacts.** When an
    app consumes the package via a `file:`/symlink (rather than a published
    tarball), the bundler follows the symlink to the real path and resolves
    the package's bare `import "react"`/`react-dom`/`react-aria-components`
    against the **ui monorepo's** own `node_modules`, not the app's. Two React
    copies → invalid-hook crashes the moment a shared-ui component mounts
    (`Cannot read properties of null (reading 'useContext')`). Typecheck and
    production build pass — it's runtime-only, and only surfaces when a ported
    component actually renders. Fix: `resolve.dedupe: ["react", "react-dom",
"react-aria-components", "react-aria", "react-stately"]` in the app's vite
    config. A **published** package doesn't hit this (peers dedupe normally),
    so it's specific to the source-linked dev workflow — but that's the
    default while the library and app evolve together.

20. **Tokens don't resolve inside multi-value CSS shorthands.** Panda
    resolves a token name only when it is the _entire_ value:
    `borderColor: "gray.700 transparent transparent transparent"` emits
    verbatim — invalid CSS the browser silently drops (the classic
    border-triangle arrow then renders in `currentColor`). Use per-side
    longhands (`borderColor: "transparent", borderTopColor: "gray.700"`)
    or interpolate explicitly (`{colors.gray.700}` in token _definitions_,
    `token(colors.gray.700)` in values). Related python-editor findings:
    template literals over imported constants and object-map lookups are
    likewise not statically extractable — property values must be
    literals or literal-branch ternaries, with runtime values on inline
    `style`; and svgr components accept `className` but not `ref` (wrap
    them when a ref is needed).

21. **A flat utility override silences a variant's interaction states.**
    Panda's `utilities` layer beats `recipes`, so `css={{ background:
"#eaecf1" }}` on a `ghost` button wins in _every_ state — the
    variant's `_hover`/`_active` backgrounds never show (Chakra's
    cascade let pseudo-class variant rules beat style props). Whenever a
    css override restyles a property the variant animates on hover/
    press/focus, restate those states in the override — or fold the
    whole look into an app-preset variant (python-editor's `sidebar`
    variant did this for the same reason).

22. **Preflight's shorthand resets beat inherited longhands — at the
    kill-switch, styles that relied on inheritance silently stop
    working.** Preflight sets `ul { list-style: none }`; the _shorthand_
    resets `list-style-position` to `outside` _on the element_, which
    wins over any value inherited from a container (inheritance only
    fills in when no declaration targets the element). python-editor's
    docs set `listStylePosition: inside` on the content wrapper and
    re-added only `listStyleType: disc` on `& ul` — post-flip the
    markers went `outside`, shifting bullets ~19px and changing text
    wrap, unnoticed until the fidelity run (the sole diff in 29 states).
    Re-assert such properties on the element itself, and audit other
    container-set inheritable properties that preflight shorthands reset
    on descendants (`list-style`, `font`, `background`).

23. **RAC Tabs, five lessons from python-editor's sidebar** (app-side RAC
    Tabs over app tokens — see the roadmap's Tabs note):
    (a) _Tabs cannot be selection-less_ — react-stately force-selects the
    first tab (firing `onSelectionChange`) when the controlled
    `selectedKey` is `null`; a collapsed-panel design must keep the last
    real selection and drive "selected" styling separately. Clicking the
    already-selected tab does _not_ fire `onSelectionChange` — use the
    tab's own click handling for reactivate-to-expand.
    (b) _Collections pre-render once without refs attached_ — effects
    touching `ref.current` on items need null guards or they crash the
    first render.
    (c) _Native `:focus-visible` on a tabindex'd div matches pointer
    clicks_ (unlike on a `<button>`), and react-aria marks the
    programmatic refocus after click-selection as focus-visible in all
    engines — keyboard-only styling (e.g. a focus underline) must require
    native `:focus-visible` AND `[data-focus-visible]` together; clicks
    fail one heuristic per engine, keyboard passes both.
    (d) _TabList may only contain Tabs_ — chrome interleaved with the tab
    strip (spacers, menus) needs a wrapper column with the TabList as one
    flex child.
    (e) _The panel's `tabIndex` belongs to react-aria_ — it re-renders
    `tabIndex` from its has-tabbable-child check, stripping externally
    set values (and `TabPanelProps` accepts none). Focus-the-panel
    behaviour needs an inner `tabIndex={-1}` wrapper owned by React.
    Also: `inert` panels drop `role="tabpanel"` — don't probe by role
    alone in tests.

24. **RAC buttons don't bubble clicks.** `usePress` handles the
    interaction without a native click reaching ancestors, so a parent
    container's `onClick` that a nested Chakra button used to trigger by
    bubbling silently stops firing — wire the nested button's own
    `onPress` explicitly (python-editor's docs-list forward arrows did
    nothing until this).

25. **Global scale overrides hide from every safeguard — diff the app
    theme against Chakra _defaults_, not just OSS-vs-private.**
    python-editor's theme shrank Chakra's whole spacing/sizes grid
    (× 0.88) and fontSizes md+ (× 0.9) in _both_ themes, so: the differ
    showed no OSS/private diff, the base preset (a snapshot of Chakra
    defaults) silently un-shrank everything, colour cross-checks passed,
    and per-component reviews compared colours/radii, not px. The result
    was a ~12% roomier app that only a human eye caught. Before porting,
    compare `space`/`sizes`/`fontSizes` (any global scale) against Chakra
    defaults and replicate overrides in the OSS app preset (the private
    preset stacks on top — no mirror needed).

26. **Slider announced values: react-aria has no `aria-valuetext`
    passthrough.** Chakra sliders often passed `aria-valuetext="20 °C"`;
    RAC owns the hidden input's ARIA and offers only
    `formatOptions: Intl.NumberFormatOptions`. Two traps: Intl's `unit`
    style accepts only the ECMA-402 sanctioned list (no mg, nT, dB…), and
    `@internationalized/number`'s fallback for engines without unit
    support (Safari < 14.1 / iOS < 14.5 — inside some apps' support
    floor) covers only degree/narrow and **throws at format time** for
    anything else. Resolution that avoids all of it: a constant unit
    belongs in the accessible _name_ ("Temperature (degrees Celsius)"),
    announced once on focus, as a translated string — which also covers
    unsanctioned units and reads uniformly across devices. Per-change
    unit repetition would need a `getValueText`-style upstream addition.

27. **Changing or (re)linking a sibling preset package needs a _clean_
    Panda regen.** Incremental codegen does not detect changes in an
    _external_ preset dependency (the private brand package, a re-linked
    `@microbit/ui`) — brand token values silently stay stale. After
    building/relinking a sibling: `rm -rf styled-system && npm run panda`
    (or `panda codegen --clean`), and restart the dev server too — the
    `theme-package` alias resolves at server start.

28. **The production cascade-layer flattening specificity-boosts layered
    rules above every rule it can't see.** The legacy-Safari fallback
    (`@csstools/postcss-cascade-layers`, production builds only) emulates
    `@layer` with `:not(#\#)` selector prefixes — but PostCSS runs
    per-file, so the boosts trample (a) **runtime-injected CSS**
    (CodeMirror base theme and `EditorView.theme` extensions) and (b)
    **other app `.css` files**, both of which relied on "unlayered beats
    layered". Dev (real `@layer`) renders correctly, so only a
    production-build check catches it — python-editor shipped a
    gray.200 editor caret this way (plus washed-out CM tooltip borders,
    structure-highlight lines, lint severity bars, docs code-chip
    borders). Two consequences:
    - **Broad defaults must live in the bottom (`reset`) layer**, which
      the flattening leaves unboosted: the Chakra-parity
      `* { border-color: gray.200 }` moved from the base preset's
      globalCss to `@microbit/ui/reset.css`, which every app's
      layers.css must import with `layer(reset)` (see the README).
    - A rule in unprocessed CSS that must beat a boosted layered rule
      anyway needs `!important` — higher specificity cannot win against
      the ID-level boosts.
      At the kill-switch, spot-check a **production build**
      (`build` + `preview`), not just dev: the fidelity harness compares
      two dev servers and is blind to production-pipeline differences —
      focus the check on runtime-styled widgets (editor carets, tooltips,
      custom-drawn borders).

Also remember (from the RAC component work, not numbered): RAC re-selects a
pressed radio value against current state after any earlier handler runs —
"click the selected option again to deselect" interactions need a native
capture listener that defers the write by a tick (see ml-trainer's
`BluetoothPatternInput`).

### Expected behavioural deltas (accept or flag at owner review)

Deliberate react-aria/library differences both completed migrations
accepted — expect them, don't chase them as bugs:

- **Tooltips re-open after click** — Chakra's `closeOnClick` kept a
  clicked trigger's tooltip closed until re-hover; react-aria re-opens it
  under the still-hovering pointer (0ms delay). If a design can't live
  with it, the library Tooltip needs a closed-until-re-enter state
  machine (unbuilt).
- **Focus rings show after mouse interaction** in places Chakra hid them
  (auto-focused dialog buttons, slider thumbs).
- **Dialogs open with focus on the dialog element itself** (announces the
  title — an a11y improvement) unless something has `autoFocus`; Chakra
  focused the first control (see gotcha #15 for when to add `autoFocus`
  back).
- **Toast semantics**: one top-centre region (no per-call `position`/
  `variant`); a ~5s minimum display for accessibility (short Chakra
  durations get longer); `toast.update()` re-adds (re-animates, restarts
  timeout) rather than updating in place; id-dedup is native.

## Decisions to front-load

Family-wide decisions that block later work if unmade (see roadmap for
per-app ones):

- Palette-generation reconciliation: two brand-palette generations coexist
  (classroom/python-editor's legacy scales vs the modern tint/shade ramps).
  Adopting modern ramps is a visible change needing sign-off per app.
- One private foundation-preset package vs per-app private presets (thin
  per-app presets over a foundation package is the working assumption).
- The `statusBarBg`-family semantic tokens: three apps have an
  ActionBar-shaped thing; agree the token set before the second app ports.
- python-editor OSS-theme simplification appetite — agreed in principle;
  scope per component during pre-work.

## Family roadmap

Priority: **python-editor-v3 and classroom are what matter**;
data-microbit-org can trail by months. ml-trainer is done (the pilot).
Censuses were taken July 2026 against Chakra v2.10 in all apps.

### v1 surface (build in the library, on demand)

Policy: anything _clearly core_ design-system goes in the library even with
a single current consumer — family-wide consistency is a goal; app-local
builds recreate the divergence being retired. Only genuinely app-flavoured
pieces stay app-side.

- **Select/ComboBox** — retires react-select family-wide (classroom's
  `SelectDropdown`/`SelectWithIcon` wrappers sketch the API; RAC ComboBox +
  `useAsyncList` covers the async school-lookup case).
- **Collapse + Fade** transition primitives (python-editor ~14 files;
  classroom/data one-offs).
- **Tabs** (recipe in the library; python-editor's branded sidebar variant
  is preset-side styling).
- Menu: checkable items (RAC has selection natively), sections, separator.
- Modal: `role="alertdialog"` mode + least-destructive initial focus (every
  app has a ConfirmDialog).
- Radio/RadioGroup (promote from ml-trainer's raw RAC usage); **GridList**
  (promote from classroom's hand-rolled react-aria hooks; also ml-trainer's
  parked projects-page idea).
- Table, TextField error slot, input adornments, Portal-as-primitive,
  Skeleton/SkeletonText, Breadcrumb, Avatar, NumberInput; cheap typography
  wrappers (Kbd/Code/Tag/Mark) as first needed.
- Hooks: `useMediaQuery`, `usePrevious`, `useClipboard`,
  `usePrefersReducedMotion`.
- Stays app-side: classroom's `active` button variant, Stepper, app-chrome
  compositions (ActionBar stays an app component over shared primitives +
  `statusBarBg`-family tokens).

### App order and notes

1. **classroom** — first (moderate size, no OSS split, heaviest Modal user
   = good packaging stress test; exercises Select/ComboBox, GridList, Menu
   checkable items early). Census highlights: theme is the ancestor/sibling
   of data-microbit-org's (same Heading `label`/`subtitle` variants with
   hardcoded `#cd0365`, Avatar `2md`, `radii.button: 2rem`,
   `withDefaultVariant(secondary)`, `outline`/`outlineDark` shadows, the
   family button vocabulary + a classroom-only `active`). `brand` is
   python-editor's legacy purple scale + `blimpTeal` — the ramp-generation
   decision lands here first. Biggest colour-audit surface: ~40 loose named
   rgba constants in `theme/constants/colors.ts` used in components and
   even inside theme variants — prime semantic-token conversion. **Latent
   bug**: the Alert `toast` variant references `bg: "code.error"` but
   classroom defines no `code` colours — fix in migration.
   Already-half-migrated: react-aria v3 hooks power the class-roster
   GridList and a SendCodeDialog listbox — these become straight RAC
   components. **react-select is load-bearing** (4 sites incl. the two
   common wrappers). Toasts all `position: "top"`, `variant: "toast"` —
   fit the shared Toast as-is. `BoxProps` forwarding: 12 files. Dead
   tooling: `styleguide.config.js` (react-styleguidist) is stale prior art.
   Fonts declared without fallback stacks — minor fix at migration.
2. **python-editor-v3** — **DONE (2026-07-30)**, second complete migration
   and the first with an OSS/private split; went ahead of classroom. Its
   status doc is retired (lessons folded into this playbook — gotchas
   #19–#26, the fidelity worked method, the Tabs decision). Salient
   outcomes for the family: RAC Tabs stayed **app-side** (special-purpose
   sidebar chrome; a generic library Tabs waits for a second consumer —
   the RAC markup and a generalised recipe extract cleanly), likewise
   SplitView; the app's teal is a _code/content_ semantic, not `brand2`
   (see Cross-app vocabulary); its bespoke density scale (spacing × 0.88,
   fontSizes md+ × 0.9, see gotcha #25) is replicated in its app preset
   pending a keep-vs-align-with-family-scale discussion.
3. **data-microbit-org** — whenever convenient; by then the surface is
   covered. Census highlights: fully private repo, no theme-package split;
   brand assets committed in-repo. **Multi-root**: three apps in one repo,
   one shared theme — including MY_DATA.HTML served from the micro:bit's
   USB mass storage over `file:` (vite-plugin-legacy SystemJS path is
   always taken; styling is one static injected stylesheet — exactly
   Panda's output shape, an improvement on runtime Emotion). Two
   entry checks at migration start (abort criteria for this app only):
   `@layer` support against the MY_DATA page's real browser matrix (a
   non-supporting browser drops all layered rules; the README's
   cascade-layer flattening plugin is the fallback), and font CORS from a
   `file:` page (`Origin: null`). Colours: the six brand ramps are
   byte-identical to ml-trainer's private preset but with **no
   `brand`/`brand2` aliasing** — palette names used directly, black/white
   button system (`primary` black bg, `secondary` black outline = default,
   `ghost` blackAlpha) — the brand-neutral end of the spectrum;
   strengthens semantic button-colour tokens over baked colorSchemes.
   Chakra's default `red` kept for form errors by explicit comment
   (supports `danger.*`). Toast Alert variant recolours near-identical to
   the other apps — covered by `toast*Bg`. Hardcoded `#cd0365` Heading
   variants and a `brandGrey #e5e5e5` ActionBar constant are
   colour-audit-class items. Two data-viz palettes exported from the theme
   dir — out of scope like all graph colours, but theme-adjacent.
   Surface demand almost entirely in-library (Modal heaviest; full
   FormControl family, Table, AlertDialog; low-frequency: Breadcrumb ×2,
   Stepper ×1, Avatar ×1, Mark ×1, Radio ×1, Fade ×2). `BoxProps`
   forwarding: 10 files. Third-party seams: react-select (unthemed, one
   site — replace with the library combobox); plotly styled via raw
   id-scoped `!important` overrides — vendor-layer candidates but expect
   specificity fights.

### Cross-app vocabulary (why the base preset looks the way it does)

The censuses established 4/4-app convergence on `radii.button: 2rem`, the
`outline`/`outlineDark` shadow names, and a `language` button variant
(colour differs per app — hence `languageText*` tokens), plus
`toolbar`/`sidebar`/`zoom`/`unstyled` variants and an ActionBar-shaped
component in three apps. Default button variant differs (`secondary` in
ml-trainer/classroom/data, `outline` in python-editor) — recipes'
`defaultVariants` must stay preset-overridable per app.

**Same slot number ≠ same role — check usage semantics before mapping an
app's second hue onto `brand2`.** python-editor's investigation:
ml-trainer's `brand2` is a general secondary accent (LED/progress/toggle/
status chrome), but python-editor's teal marks _code/machine-origin
content_ (docs code embeds, drag handles, sensor icons) and is never
chrome — mapping it to `brand2` would have crossed the two apps' chrome
onto opposite tokens. Its teal stayed an app-specific semantic category
(sibling of its `code.*` palette). Genuine family-wide holds: `toast*Bg`
on teal, errors/destructive on red/`danger`.

After the family migration completes, the Chakra token snapshot becomes a
**malleable base** — it is a parity constraint only while Chakra apps
remain the comparison point; then evolving scales/values in place is fair
game.
