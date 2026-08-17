# Hints for working on this library

Behaviours of Panda CSS and react-aria-components that fail silently or
against intuition, learned the hard way. Read before component or styling
work. Consumption setup and the CSS-variable contract are in
[`packages/ui/README.md`](../packages/ui/README.md).

## Panda extraction

- **Styles must be literals at the JSX/`css()` site.** The extractor only
  reads object literals where they appear — not objects returned from
  helpers, not computed values (``w={`${x}px`}``, `rowSpan={n + 1}`), not
  style props forwarded through a plain wrapper component. It fails
  silently: the class is applied but no CSS exists for it, and a
  coincidental identical class from another call site can mask the miss.
  What works: same-file consts, ternaries of literals, literal arithmetic,
  and style props on `styled()`-factory components (cross-file). For
  data-driven values use inline `style`, with runtime `token()` lookups.
  Verify against the generated CSS, not the rendered page.
- **Utility-named props extract from _any_ capitalised JSX component.**
  Extraction is per-prop-name, not per-component: a custom prop that shares
  a utility's name (e.g. `content`) emits a broken CSS rule. Don't use
  utility names for non-style props.
- **Tokens only resolve when they are the entire value.** In a multi-value
  shorthand (`borderColor: "gray.700 transparent"`) the token name emits
  verbatim — invalid CSS the browser drops. Use per-side longhands, or
  interpolate explicitly (`{colors.gray.700}` in string values).
- **`styled.tag` requires importing `styled` from `styled-system/jsx`.**
  The `@microbit/ui` re-export works for `styled(Component)` but Panda
  doesn't recognise the member-expression form through a re-export: the
  classes land on the element and no CSS exists for them.
- **Runtime-selected variants need `staticCss` in the preset.** `variant`/
  `size` forwarded as props are invisible to static analysis. If a preset
  adds recipes or variants selected at runtime, extend `staticCss` in the
  preset itself — never only in a `panda.config.ts`, which a consumer
  doesn't inherit.
- **Regenerate before believing any measurement.** `npx vite` and friends
  skip the `prestart`/`prebuild` codegen hook, so the generated CSS can be
  stale and a correct-looking port renders wrong. Grep the generated CSS
  for the expected class (mind the name: `h_23`, not `h_23px`).

## Panda cascade and recipes

- **Same-property conflicts across separate `css()` calls race on emit
  order.** cx'ing a base class with an override class does not mean the
  override wins; merge into a single `css(base, override)` call so
  conflicts resolve at merge time. Longhands beat shorthands across calls
  too. (A `styled()` factory's own props are safe: base, variants and props
  merge before emitting.)
- **A flat `css` override silences a variant's interaction states.** The
  `utilities` layer beats `recipes` in every state, so overriding a
  property the variant changes on hover/press means restating those states
  in the override — or promoting the whole look to a variant.
- **One variant group's flat value cannot beat another group's responsive
  value.** Panda hoists every media query below all base rules, so above
  the breakpoint the responsive rule wins on source order regardless of the
  recipe. The fix is a doubled selector in the variant that must win:
  `"&&": { fontSize: "4xl" }`. Don't reason about emit order — it tracks
  extraction order, not the recipe; read it out of `panda cssgen`.
- **A container style that a child's recipe should be able to override has
  to live in `globalCss`, not the container's `css()`.** A container styling
  its children from `utilities` outranks every variant, so a "default unless
  the variant says otherwise" rule inverts. `globalCss` emits into `base`,
  below `recipes`, which is where the attached ButtonGroup's fallback seam
  colour sits (`[data-attached] > *` in base-preset.ts): a variant with its
  own border wins, a borderless one keeps the transparent gap. Logical and
  physical properties resolve against each other by layer, so the base rule's
  `borderInlineColor` still loses to a recipe's `borderColor`.
- **CSS can never read a used value back, so a rule that needs to do
  arithmetic on a length either gets it as a custom property or must be
  designed not to need it.** An attached ButtonGroup overlaps adjacent
  buttons by their border width so the two coincide as one seam. Plumbing
  each variant's width through a property was the first fix; fixing the seam
  at 1px removed the question, and made a better-looking group than matching
  the outline did.
- **Prefer geometry a focus ring can follow.** `focusRing` draws a real
  `outline`, which tracks the border box: any layout that makes an element's
  border box differ from the shape you see (dropping the border on one side
  of a seam, say) puts the ring off centre by that much, and at 2px it lands
  exactly on top of what it was meant to sit outside.
- **A recipe declaration that call sites are expected to override must stay
  at single-class specificity.** State-derived values belong in a custom
  property the base declaration reads (`color: var(--avatar-color, …)`),
  not in a higher-specificity state selector that outguns a call-site
  `css`.
- **`colorPalette.<stop>` typechecks for stops the palette doesn't have,
  and renders nothing.** The key space is the union of every stop name
  across all colour tokens, so `gray`'s private 10/75/350 and the
  `button.*` sub-names are offered under every palette. A miss emits a var
  that resolves to nothing and the declaration is dropped — an invisible
  control, no error at build or runtime. Feed anything palette-driven from
  a vetted allowlist (the Button recipe's `tone`).
- **Slot recipes outrank plain recipes as a layer, not by specificity.**
  Panda emits slot recipes into `@layer recipes.slots`, ordered after
  `recipes`, so a slot-recipe rule that reaches into another recipe's
  element (`"&:hover input"` in a slot recipe, targeting the `input`
  recipe's element) beats every rule of that recipe outright — no
  specificity can save the focused/invalid states. Such cross-recipe rules
  must exclude the states they'd override in a `:not()` list (see the
  numberField group's hover).

## react-aria-components

- **A non-collection child silently truncates a collection.** In a `Menu`,
  `ListBox` or `GridList`, anything that isn't a collection node — a
  `<div>`, a dialog — ends the collection there; everything after it
  disappears with no warning, and a fragment that _leads_ with one renders
  the collection empty. Hoist dialogs and file inputs out (opener via
  context or prop); file inputs doubly so, since popovers unmount on close
  and drop a change event mid-pick. A regression test in
  `packages/ui/tests/Menu.test.tsx` will tell us if react-aria ever starts
  reporting it.
- **Popovers portal to the body.** They leave the stacking context they
  were opened from, so an overlay opened inside a modal needs a `z-index`
  above `modal` (1400) — the `menu` recipe sits at `popover` (1500) for
  this; check any new overlay recipe. And the modal underlay a popover
  renders takes hover off everything behind it: a container with a hover
  look that contains a menu keeps its highlight via
  `"&:has([aria-expanded=true])"` (see the `gridList` item), restated
  inside any selected/active rule since `:has()` adds no specificity of
  its own.
- **RAC buttons don't bubble clicks.** `usePress` handles the interaction
  without a native click reaching ancestors, so a parent's `onClick` never
  fires for a nested button — wire the nested `onPress` explicitly.
- **State attributes never land on `Label`.** `labelProps` is only
  `{id, htmlFor}`; disabled/invalid state is stamped on the field _root_
  and the control. Style a label slot from the root:
  `"[data-disabled] > &": { opacity: 0.4 }`.
- **RAC `Text` renders a `<span>`**, so a recipe slot relying on vertical
  margin does nothing under a container that brings no layout of its own
  (RadioGroup, CheckboxGroup) — give such slots an explicit
  `display: block`.
- **`<Focusable>` stamps `tabIndex=0` on its child**, so wrapping a
  container that holds a real `<button>` creates a second tab stop. When
  the child manages its own focus, anchor the overlay with an explicit
  `triggerRef` instead (the library `Tooltip` supports this).
- **Pass variant props through the recipe's `splitVariantProps`.** A
  component that hand-picks (`{ size }`) or calls its recipe with no
  arguments breaks the preset extension point: an app preset that adds a
  variant group gets nothing applied and the prop lands on the DOM,
  silently.
- **RAC does not position everything logically.** Where a component reads
  `useLocale().direction` and mirrors a physical property itself, anything
  you position alongside it has to mirror the same way — `Slider`'s thumb
  is a physical `left` that react-aria flips in RTL, so a logical
  `insetStart` on the mark lands it across the track from the thumb. Check
  what the component actually emits before reaching for logical properties —
  it is not consistent even within one RAC file: `SliderThumb` uses `left`
  where `SliderFill`, alongside it, uses `insetInlineStart`. (We render our
  own filled track rather than `SliderFill`, so ours is the `filledTrack`
  slot in `Slider.recipe.ts`.) Everything that is ours and not tracking a
  RAC element should be logical.

## Tests and stories

- **Scope modal lookups to `<section>`.** RAC popovers (menus included)
  are `role="dialog"` too, and linger with `data-exiting` while animating
  out; role queries also don't exclude `inert` subtrees, so unscoped
  `getByRole` goes ambiguous the moment overlays stack. Modals render on a
  `<section>`; popovers are `<div>`s.
- **Wrap modal stories in a full-height box** before believing an overlay
  is mispositioned: an overlay opened from inside a `Modal` positions
  against the document, so a story body shorter than the viewport throws
  it hundreds of pixels off. Real app pages don't show this; stories do.
- **A recipe rule no story exercises can be dead for months.** Deduping
  and typechecks don't catch a selector that matches nothing; a story
  rendering the whole component set in each state does (see
  `Forms/Field chrome`).
