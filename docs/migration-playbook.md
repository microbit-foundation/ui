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

1.  **CSS layer conflict (the big one).** Unlayered CSS always beats layered
    CSS regardless of specificity. During coexistence Chakra/Emotion are
    unlayered — hence `bin/unlayer-panda.mjs`. After the kill-switch the rule
    applies to **third-party stylesheets**: any unlayered vendor CSS beats
    every Panda rule (Swiper's `.swiper-slide { width: 100% }` collapsed
    ml-trainer's carousels). Import vendor stylesheets into the `vendor`
    cascade layer (`@import "..." layer(vendor)`), which `layers.css` orders
    between `reset` and `base` so vendor CSS beats the preflight but loses to
    app styling. Runtime CSS-in-JS (react-select's Emotion) cannot be
    layered — replace the component instead.
2.  **RAC interaction states.** The base preset widens Panda's `hover`/
    `active`/`focusVisible`/`disabled` conditions to also match RAC's
    `data-*` attributes, so Chakra-shaped `_hover`/`_active` style objects
    work unchanged on RAC.
3.  **`staticCss` for recipe variants.** Components forward `variant`/`size`
    as runtime props, invisible to Panda's static analysis. The base preset
    carries `staticCss` for library recipes; if an **app preset** adds
    recipes or variants selected at runtime, it must extend `staticCss` in
    the preset too (never only in `panda.config.ts` — a consumer that drops
    it silently loses variants; this migration's signature failure class).
4.  **Responsive recipe variants must be symmetric.** Panda applies the
    base-breakpoint variant's CSS unconditionally; if `full` sets more props
    than `4xl`, they leak into desktop. Every non-full dialog size restates
    the box props so the larger breakpoint fully overrides `full`.
5.  **Know exactly which ramps the app's theme overrode.** ml-trainer's OSS
    `brand2` is Chakra's _unmodified_ gray, not the locally overridden
    `gray` — conflating them made card text near-invisible. Check ramp
    provenance token-by-token (the differ helps).
6.  **OSS vs private divergence → semantic tokens.** Structural forks
    (variant colours, fonts, gradients) are driven by semantic tokens the
    private preset overrides (`languageText*`, the `display` font,
    `statusBarBg`), keeping recipes shared. Recipe extension is the escape
    hatch, not the plan.
7.  **Icons inherit `currentColor`.** Don't pass `fill` to react-icons (it
    overrides their default `fill="currentColor"` → black). `Icon`/
    `CloseIcon` set `fill: currentColor` in CSS.
8.  **Atomic overrides: same-property conflicts across separate `css()`
    calls race on stylesheet order** — cx'ing a base class with an override
    class does NOT mean the override wins; the winner is whichever atomic
    rule is emitted later. Merge base + overrides into a _single_
    `css(base, cssProp)` call so conflicts resolve at merge time. Related:
    longhand beats shorthand across calls; and a border shorthand plus
    separate `borderColor` in one object is order-dependent — use
    width/style longhands with `borderColor`.
9.  **Styles must be literals at the JSX/`css()` site.** Panda's extractor
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
    padding spacer stacks above the child.

    **Check the support floor before reaching for the native `aspectRatio`
    property, which this gotcha used to recommend outright.** Native
    `aspect-ratio` needs Safari 15, iOS 15 and Firefox 89; the family's floor
    is `safari >= 14.1`, `ios_saf >= 14.5`, `firefox >= 88`, so three of five
    targets don't have it and the declaration is simply dropped — the box
    collapses to content height, with no fallback and nothing for lightningcss
    to downlevel. Panda's pattern is the padding-bottom hack, exactly like
    Chakra's, so it works everywhere: classroom measured the two identical
    (wrapper 185x151, `::before` padding-bottom 150.922px, child absolute with
    `object-fit: cover`).

    The conflict this gotcha is really about only arises when the child is a
    **Chakra** component carrying its own `position`. A plain element or an
    already-ported child is fine, so during coexistence order the child's port
    before the wrapper's and the pattern is safe.

    **Worth auditing in the completed migrations**: ml-trainer has the same
    floor and uses native `aspectRatio` in `tours.tsx` (x2) and
    `NativeBluetoothConnectBatteryDialog.tsx`; python-editor's floor is
    `Safari >= 14`/`iOS >= 14` and it uses it in the docs content, the ideas
    page and `YoutubeVideoEmbed`. Those may want the pattern instead.

12. **RAC popovers unmount on close** (Chakra kept menu lists mounted), so
    a hidden file input must live _outside_ a menu or its change event is
    dropped mid-pick — render it as a sibling and call it via ref. Putting one
    inside is doubly wrong: see #33, where a non-collection child silently
    deletes the rest of the menu. Chakra's keep-mounted behaviour also trips up
    verification scripts — `document.querySelector('[role=menu]')` finds a
    closed menu from an earlier step, so scope to the visible one.
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
    Confirmed from the other direction in classroom: `<MakeCodeIcon h={23}
w={23} />` on a _plain_ wrapper that spreads onto a `styled()` svg
    extracted fine and emitted `height: 23px` — Panda appends `px` to
    unitless numbers for dimension properties, and resolves a number to a
    token when one exists for that key, both exactly as Chakra did. So
    #9's real scope is _non-literal_ values and non-utility prop names;
    a literal utility prop survives a plain wrapper as long as the wrapper
    forwards it to something styled. Verify in the generated CSS either way
    — the class name may not be the one you guess (`h_23`, not `h_23px`).
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
    **classroom then turned out to carry the identical scale** (the same
    2022 theme change, byte-identical values), so it now lives in
    `@microbit/ui/dense-preset`, stacked between the base and app presets
    by both apps — one explicit, shared place for the override this gotcha
    is about, and one place to answer the keep-vs-align question.

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

29. **Panda's preflight poisons `border-color: inherit` chains with a
    `currentcolor` keyword.** The preflight (base layer, above `reset`)
    sets `border-color: var(--global-color-border, currentcolor)` on every
    element; `currentcolor` stays a keyword at computed-value time, so a
    child with `border-color: inherit` (the Chakra checkbox/radio control
    convention) resolves it against its OWN `color` — a checked-style
    `color: white` control renders an invisible white border, where Chakra
    inherited the real gray.200 from its global reset. `getComputedStyle`
    on the parent reports the resolved colour, not the keyword, so the
    break is invisible to computed-style checks — probe with a child that
    inherits. Fix: `@microbit/ui/reset.css` defines
    `:root { --global-color-border: var(--colors-gray-200) }` (Panda's
    supported hook), making the preflight itself carry the Chakra-parity
    default.

30. **`<hr>` changes box model at the kill-switch.** Chakra's reset carries
    normalize's `hr { box-sizing: content-box }`; Panda's preflight sets
    `box-sizing: border-box` on everything and has **no `hr` exception**. So
    an `<hr>` with an explicit height _plus_ top/bottom borders is one height
    before the flip and 2px shorter after it, with nothing in the diff to
    show why (same family as #22 — a preflight difference that only bites at
    the flip). Panda's preflight also gives `hr` a `border-top-width: 1px`
    that Chakra's didn't; the library Divider's `border: 0` base covers it.
    Watch for the **zero-size-`<hr>` double-edge trick** — `borderWidth: 1px`
    on all four sides of a 0-width `<hr>`, the two side borders reading as a
    single 2px rule. It was in three apps, and besides being obscure it makes
    the rule's length depend on the box model. `Divider`'s
    `thickness="thick"` draws 2px on the orientation's own edge with no
    top/bottom borders, so its height is whatever it is told — identical
    either side of the kill-switch. classroom's logo divider was 35px
    (33 + 2 borders) under Chakra and is now the 33px its code asks for: a
    deliberate 2px change, taken in exchange for being box-model-stable.
    It was also the _only_ pixel difference across five screens when the
    leaf primitives were ported.

31. **A recipe variant's flat value cannot override another variant group's
    responsive one.** Chakra merged `size` and `variant` in JS before emitting,
    so `<Heading size="lg" variant="label">` got the variant's flat
    `fontSize: 4xl` at every width. Panda emits each variant as its own class
    and hoists **every** media query into a block after all the base rules, so
    above `md` the _size_ variant's media rule wins on source order no matter
    how the recipe declares them — classroom measured 26.99px where Chakra gave
    32.4px. Nothing in the types or the generated class names hints at it; it
    only shows above the breakpoint. Rules:

    - An app-preset variant that sets a property the shared `size` variant sets
      responsively must be paired with a **flat** size (`md`/`sm`/`xs`) or with
      no size at all — check what `defaultVariants` then supplies, since it is
      still in play (the `heading` recipe defaults to `size="xl"`, whose `md`
      fontSize happens to be `4xl`, which is why dropping `size` reproduced
      Chakra exactly).
    - Do not reach for declaration order, `compoundVariants` ordering or a
      matching responsive value in the variant: within the media block the
      order is Panda's, not the recipe's.
    - Distinct from #8: **a `styled()` factory's own props _do_ beat its recipe
      base and variants**, because Panda merges base + variants + props before
      emitting, so the element carries one class per property. #8's atomic race
      is between separate `css()` calls cx'd together. Verified on Divider:
      `borderLeftWidth={0}` over the recipe's `1px`, and a `borderColor` tint
      over its `gray.200`, both take effect even though the recipe's classes
      sit later in the stylesheet.

32. **App code that reads Chakra's CSS variables breaks at the kill-switch, not
    when you port the component.** `var(--chakra-colors-brand-500)` inside a
    hand-written value — a gradient, a shadow, a border — keeps resolving for as
    long as `ChakraProvider` is mounted, so it survives the port of its own
    component and every screenshot comparison, then silently becomes an invalid
    value when the provider goes. Gradients are the common case and they fail
    to _nothing_, so the element just loses its background.

        Audit it up front, not at the flip: `grep -rn -- "--chakra-" src/`. Panda
        resolves `{colors.brand.500}` inside an arbitrary string value at build
        time, which is the direct replacement (`background="linear-gradient(90deg,

    {colors.brand.500} 0%, …)"`emits`var(--colors-brand-500)`). classroom had
    one live instance, its homepage banner, plus one in a comment.

33. **A non-collection child silently truncates a RAC collection.** A `Menu`,
    `ListBox` or `GridList` builds its children into a collection, and anything
    that is not a collection node — a `<div>`, a dialog, a plain element — ends
    the collection at that point. Everything after it disappears. There is no
    throw and no console warning, in dev or prod, so a typecheck and a unit test
    that only asserts "renders" both pass.

    Measured in classroom's port: `<MenuItem/><div/><MenuItem/>` renders one
    item, and a component returning a fragment that _leads_ with a `<div>`
    renders none at all — the whole menu comes back empty. The second shape is
    the dangerous one, because it is what a "menu item that owns its dialog"
    component looks like:

    ```tsx
    // Deletes every item in whatever menu renders it.
    const LanguageMenuItem = () => (
      <>
        <LanguageDialog isOpen={…} onClose={…} />
        <MenuItem onAction={…}>Language</MenuItem>
      </>
    );
    ```

    Fragments, `null`, `false`, arrays and custom components are all fine, so
    long as everything they resolve to is a collection node. Hoist dialogs (and
    file inputs, per #12) out of the menu: give the opener to the item through
    context or a prop, and render the dialog beside the `MenuTrigger` or at the
    app root. classroom added a `LanguageDialogProvider` for exactly this, since
    the item is rendered by six different menus.

    `@microbit/ui` has a regression test asserting the truncation, so if
    react-aria ever starts reporting it we can drop the workarounds.

34. **A RAC popover leaves the stacking context it was opened from.** It always
    portals to the body, so a menu, tooltip or select opened from inside a modal
    is no longer painted by the modal — it needs a `z-index` above it or it
    disappears behind. Chakra never showed this because its MenuList rendered
    inline unless explicitly portalled, so the bug appears exactly at the port
    and, in a full-screen modal, the menu is invisible rather than merely
    clipped. The `menu` recipe now sits at `popover` (1500) rather than
    `dropdown` (1000) for this reason; check any new overlay recipe against
    `modal` (1400) before assuming the default scale is right.

35. **The library Modal inserts an element between the dialog box and its
    children.** Chakra's ModalContent was their direct parent, so a call site
    that laid out its content by styling the box — `display: flex` plus
    centring, most often — silently stops working: `contentCss` styles the box,
    but the children are inside a flex-column `inner` element within it. The
    tell is nasty, because every box measurement stays identical and only the
    content moves (classroom's loading spinner drifted 141px off centre). Put
    the layout on a wrapper inside the dialog instead.

36. **Run the Panda codegen before any verification pass.** `npx vite` and
    friends skip the `prestart`/`prebuild` hook, so `styled-system.css` is
    whatever the last codegen produced and every atomic class introduced since
    is missing from it. The failure looks exactly like a botched port — a
    heading rendering at the slot's default 18px instead of the 43.2px the
    `css` prop asks for — and the code looks right, because it is. Check the
    generated CSS for the class before believing a measurement:
    `grep -o "md\\:fs_5xl" src/styled-system.css`.

37. **A component that hand-picks recipe variants breaks the preset extension
    point.** `Input` and `TextField` destructured `size` and passed `{ size }`
    to the recipe, leaving anything else in the rest-spread — so an app preset
    that _adds_ a variant group got no styling at all and the prop landed on
    the DOM as an unknown attribute. Nothing caught it because the base recipes
    only had `size`; classroom's `variant="classroom"` inputs had been
    rendering as plain outline boxes. Library components should use the
    recipe's generated `splitVariantProps` so later presets keep working:

    ```tsx
    const [variantProps, rest] = input.splitVariantProps(props);
    <input className={input(variantProps)} {...rest} />;
    ```

    Worth grepping for when adding any component: a literal variant name inside
    a recipe call is the smell.

38. **react-select's behaviours are props on a ComboBox, not styling.** Four
    of them, all of which classroom's sites relied on and none of which comes
    free:

    - It **opened its menu on click**; react-aria waits for typing
      (`menuTrigger="focus"` restores it), which otherwise leaves the chevron
      as the only way in.
    - It **filtered on `label`, with `matchFrom: "start"` available**;
      react-aria filters static children on `textValue`, always substring, so
      prefix matching means filtering the children yourself.
    - Its **`noOptionsMessage`** needs `allowsEmptyCollection`, or the popover
      closes the moment nothing matches and the message never shows.
    - Sites that **hid the menu with `display: none`** to gate on a query
      length need a real "don't render the popover" prop; an empty list still
      opens an empty card.

    Also: react-aria renders a listbox's empty state as a `role="option"` row,
    so a test that counts options counts "no matches" as a match.

39. **`--trigger-width` is the input's width in a ComboBox, not the control's.**
    RAC measures the element it anchors to, which for a ComboBox is the text
    input inside the control — narrower than the field by its padding and
    border, so a card sized from the var comes out visibly narrow. `Select` is
    fine (its trigger is the button). The library's ComboBox measures its own
    control instead, so consumers need do nothing; the trap is worth knowing if
    you build another popover on RAC.

    The obvious fix — reading the trigger ref while rendering the popover —
    quietly does nothing: RAC mounts the popover from the first render, before
    the ref is set, and nothing re-renders it afterwards. It needs state set
    from a layout effect.

40. **During coexistence a call site's `css` beats a recipe only on
    specificity — there are no layers to settle it.** Gotcha #21 says a flat
    utility override wins every state; that is true _after_ the kill-switch,
    where `utilities` outranks `recipes` as a layer. While Chakra is still
    mounted the layers are stripped (#1), so the two are ordinary rules and the
    winner is the more specific one, or the later one at equal specificity
    (utilities are emitted after recipes, so equal-specificity ties go to the
    call site). Two consequences, both measured in classroom's roster port:

    - **A recipe declaration a call site is expected to override must be a
      single-class selector.** The Avatar's contrast rule was
      `&[data-light-bg] { color: gray.800 }`, at (0,2,0), and it beat a call
      site's `css={{ color: "gray.600" }}` at (0,1,0) — a greyed-out offline
      student came out gray.800. State-derived values belong in a custom
      property the base declaration reads (`color: var(--avatar-color, …)`),
      which is also what Chakra did and what keeps an inline value from
      beating the call site outright.
    - **Restating a state is not enough if the recipe combines two of them.**
      A ListBox option's `&[data-selected] { _hover: … }` is (0,3,0); an
      override's `_hover` (0,2,0) and `&[data-selected]` (0,2,0) both lose to
      it, so a selected _and_ hovered row keeps the recipe's background. Match
      the combination: `"&[data-selected]": { bg: …, _hover: { bg: … } }`.

    Both disappear at the kill-switch, which makes them easy to write off — but
    they are wrong for the whole coexistence period, i.e. for every screenshot
    anyone compares.

41. **`styled` must be imported from `styled-system/jsx` to use the
    `styled.tag` form.** `@microbit/ui` re-exports it, and the re-export is
    fine for `styled(Component)` — but not for `<styled.table>`: Panda decides
    whether a member expression is its factory by looking at where the
    identifier was imported from, and a re-export is not that module. The JSX
    renders, the classes land on the element, and no CSS exists for them —
    gotcha #9's silent failure with a new cause. classroom's About-dialog
    table lost every style this way (`border-collapse`, the caption, the row
    rules), and only a grep of the generated CSS showed it.

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
- **A menu opened with the mouse focuses no item.** Chakra highlighted the
  first one however the menu was opened; RAC highlights it only for a keyboard
  open, and Escape still returns focus to the trigger (both verified in
  classroom). It is the whole of the remaining screenshot diff on a faithful
  menu port, so expect it and don't chase it.
- **Choosing an option in a `MenuOptionGroup` leaves the menu open.** That
  matches Chakra's checkbox groups; Chakra's radio groups closed.
- **Dialogs open with focus on the dialog element itself** (announces the
  title — an a11y improvement) unless something has `autoFocus`; Chakra
  focused the first control (see gotcha #15 for when to add `autoFocus`
  back).
- **`scrollBehavior` is gone.** Chakra defaulted to `inside` (the box capped
  at the viewport, its body scrolling); the library always scrolls the
  backdrop, which is Chakra's `outside`. Nothing in the family needed the
  distinction — classroom's eight `outside` sites simply dropped the prop —
  but a dialog taller than the viewport now grows the page rather than
  scrolling internally.
- **`preserveScrollBarGap` and `blockScrollOnMount` have no equivalent**; RAC
  does its own scroll locking. Drop them.
- **Toast padding is roomier than Chakra's** (measured in classroom: 14.08px
  vertical against 10.56px, and 35.2px against 28.16px on the close-button
  side, at the same width). Long descriptions that fitted on one line may wrap.
- **Chakra's `Progress` `hasStripe`/`isAnimated` have no equivalent.** The
  ProgressBar takes a percentage, not value+max, and needs an explicit
  `aria-label` where Chakra's had none. If the stripes matter, restate them at
  the call site with a `barCss` gradient over a keyframe in the app preset
  (classroom's ProgressDialog does).
- **Toast semantics**: one top-centre region (no per-call `position`/
  `variant`); `duration` defaults to 5000ms and there is no
  `duration: null` — use `persistent: true` (which forces the close
  button on) for toasts that must not auto-dismiss; `toast.update()`
  re-adds (re-animates, restarts timeout) rather than updating in place;
  id-dedup is native.

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

### Open across the completed migrations

- **Native `aspect-ratio` below the support floor** (see gotcha #11, corrected
  2026-08-02 — it previously recommended exactly this). It needs Safari 15 /
  iOS 15 / Firefox 89; where an app's floor is lower the declaration is dropped
  and the box collapses to content height, silently and with no fallback.
  Panda's `AspectRatio` pattern is the padding-bottom hack and works at any
  floor. **To check**: ml-trainer (floor 14.1 / 14.5 / 88) at `tours.tsx` x2
  and `NativeBluetoothConnectBatteryDialog.tsx`; python-editor (floor
  `Safari >= 14`, `iOS >= 14`) in the docs content, the ideas page and
  `YoutubeVideoEmbed`. Not verified as visibly broken on those browsers —
  someone with a device or a Safari 14 VM should confirm before deciding
  whether to swap them back to the pattern.

### v1 surface (build in the library, on demand)

Policy: anything _clearly core_ design-system goes in the library even with
a single current consumer — family-wide consistency is a goal; app-local
builds recreate the divergence being retired. Only genuinely app-flavoured
pieces stay app-side.

Built since (check `packages/ui/src/index.ts` before assuming a gap — this
list is what was outstanding when the censuses were taken): Collapse + Fade,
Menu checkable items/sections/separator, Modal `role="alertdialog"`,
Radio/RadioGroup, NumberField, Kbd/Code, `useMediaQuery`/`usePrevious`/
`useClipboard`/`useBreakpointValue`.

Still outstanding, in classroom's likely order of need:

- ~~**Select/ComboBox**~~ — **built** (classroom, area 6), retiring
  react-select there; one `select` slot recipe behind both. Sections,
  multi-select and async loading via `useAsyncList` are still unbuilt — the
  data-microbit-org school lookup will want the last of those.
- ~~**GridList**~~, ~~**Avatar** (+ badge)~~ and ~~**ListBox**~~ — **built**
  (classroom, area 7), retiring the last of its hand-rolled react-aria v3
  hooks. Avatar reproduces Chakra's name-hash colour and its contrast rule
  exactly, so a migrating roster keeps its colours. ListBox arrived with the
  GridList because the two are the halves of the same question: rows with
  their own controls need the grid, leaf options the listbox. `Checkbox`
  gained `control={false}` at the same time, for a checkbox whose children
  draw the selected state (a selectable tile).
- Portal-as-primitive, TextField error slot, input adornments,
  Skeleton/SkeletonText, Breadcrumb, NumberInput; cheap typography
  wrappers (Tag/Mark) as first needed.
- `usePrefersReducedMotion`.
- **Tabs** — stayed app-side in python-editor (special-purpose sidebar
  chrome); waits for a second consumer, at which point the RAC markup and a
  generalised recipe extract cleanly.
- Stays app-side: classroom's `active` button variant, Stepper, app-chrome
  compositions (ActionBar stays an app component over shared primitives +
  `statusBarBg`-family tokens).
- **Table: decided against** a shared component. python-editor's one table
  (the About dialog's version/dependency list) is a `styled.table` with
  Panda styles at the site, and that reads better than a slot recipe
  wrapping native table semantics. Both remaining apps have ~1 table site
  each; do the same unless one grows a real data table.

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
   (see Cross-app vocabulary); its density scale (spacing × 0.88, fontSizes
   md+ × 0.9, see gotcha #25) turned out to be shared verbatim with
   classroom and now comes from `@microbit/ui/dense-preset`, still pending a
   keep-vs-align-with-family-scale discussion.
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

**Two button colour idioms, one recipe.** The `primary`/`secondary` variants
split 2–2: brand-coloured (ml-trainer, python-editor) vs black-on-white
(classroom, data-microbit-org — black solid, black outline, and a
blackAlpha wash on hover/press instead of a border-colour change). Both
resolve through `button.*` semantic tokens in the base preset
(`primaryBg`/`primaryHoverBg`/`primaryActiveBg`,
`secondaryText`/`secondaryBorder`/`secondaryHover*`/`secondaryActive*`), so
the second idiom is nine token values in an app preset rather than a forked
variant — which is what the two apps on that side would otherwise both
write. `primary`'s text stays a literal `white` (4/4 apps) and `ghost`
needs no tokens (black + blackAlpha in 4/4).

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
