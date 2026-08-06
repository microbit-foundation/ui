# Form controls: label weight, control sizes, and field layout

Working sessions on 2026-08-05 and 2026-08-06 (Matt + Claude). The code
described under "Already in the tree" is written but **uncommitted and
unreviewed**; everything under "Decided" is agreed design, not started. Read
`migration-playbook.md` gotchas #44 and #45 and the field-chrome roadmap bullet
first — they are the same thread. The open questions from the first session
are all answered; this is now a plan to implement, in the order under
"Sequencing".

The trigger was a duplication review of the six labelled field components.

## Already in the tree (uncommitted)

One change, three parts, CI green (78 tests, typecheck, build-storybook):

- **`select`'s `label` slot is gone.** Select and ComboBox render their labels
  from the `field` recipe like every other field. The two slots had drifted —
  `select.label` lacked `display: block` and the disabled rule.
- **The disabled label rule works now.** `field.label`'s
  `"&[data-disabled]"` matched nothing: react-aria never puts state attributes on
  a `Label`, only on the field root and the control. Now
  `"[data-disabled] > &"`, plus the `transitionProperty: opacity` Chakra's
  FormLabel had. Playbook gotcha #45 has the detail.
- **`FieldLabel` is exported**, and all six fields render through it. It takes
  `isRequired`, a `css` override, and passes `id`/`htmlFor` through for
  composites labelling a control react-aria isn't wiring.

Plus a `Disabled` story on `Forms/Field chrome` and an `it.each` asserting each
field's label carries `field().label`. The story matters more than it looks:
both #44 and #45 were wrong rules sitting in already-shared code, which no
amount of deduplication catches. What catches them is rendering the whole set in
the state.

## Decision taken: align labels on `normal`

`field.label` goes from `fontWeight: medium` (500) to `normal` (400).

The reasoning, so it isn't relitigated. `medium` is Chakra's FormLabel weight,
ported for parity. Eight app call sites pass a visible `label` to a library
field; seven take that default. The overrides are all one category — settings
rows, where the label is a preference name beside its control rather than a form
field's label, and where the Chakra originals overrode FormLabel the same way
(`mb="0" fontWeight="normal"`). Rather than keep a default nothing structural
wants, the default moves and the overrides go.

**This is a deliberate parity break** and wants recording under the playbook's
"Expected behavioural deltas". **The playbook's field-chrome roadmap bullet
(~line 1111) still argues the opposite** ("`fontWeight: medium` is right…
don't align the default down; a `weight` variant would serve better") — it
predates this decision and must be rewritten in the same commit, or the next
session relitigates it.

The change is invisible on macOS and Windows (no 500 face in the
Helvetica/Arial stack — see "Facts" below), real on Android/Chrome OS/Linux
and under any future webfont brand preset. **Owner decision 2026-08-06: no
device check needed; ships on reasoning.**

### Ripple: two overrides to remove

Six settings rows (one library NumberField, five hand-rolled select rows)
render at `normal` today, but the styling lives in three places and only two
of them say so explicitly:

| Location                                                 | Override                                               |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `python-editor-v3/src/settings/SettingsArea.tsx:68`      | `labelCss={{… fontWeight: "normal" …}}` on NumberField |
| `python-editor-v3/src/settings/SelectFormControl.tsx:42` | `fontWeight="normal"`                                  |
| `ml-trainer/src/components/SelectFormControl.tsx:38`     | (none — inherits; see the divergence below)            |

`data-microbit-org/src/components/FormField.tsx:68-76` keeps its override: those
dialogs want `bold` at `lg`, which is a third case and not in scope here.

## Decided: size variants, label follows automatically

The ask was "we want the ability to have different sizes of form control".
Today that is half-true, and the missing half is exactly the controls
python-editor's settings use.

| Control              | `size` prop?             | Where from                                                                                       |
| -------------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| `TextField`          | yes — `sm`/`md`/`lg`     | `input` recipe (`Input.recipe.ts:72`)                                                            |
| `NativeSelect`       | yes — same scale         | `input` recipe                                                                                   |
| `Radio`, `Checkbox`  | yes — own `sm`/`md`/`lg` | `Radio.recipe.ts:89`, `Checkbox.recipe.ts:84`                                                    |
| `NumberField`        | **no**                   | calls `input()` with no variant (`NumberField.tsx:74`)                                           |
| `Select`, `ComboBox` | **no**                   | `select` recipe has no variants; trigger hard-codes `h: "10"`, `px: "4"` (`Select.recipe.ts:70`) |
| The label            | **no**                   | `field` recipe has no variants, so a label never scales with its control                         |

The evidence that this is a missing prop rather than a hypothetical:
python-editor's settings NumberField passes
`inputCss={{ h: "8", fontSize: "sm", borderRadius: "sm", px: "3" }}`
(`SettingsArea.tsx:70`), which is byte-for-byte `Input.recipe.ts:75`'s `sm`.
That call site is hand-rolling `size="sm"` because the prop does not exist.

The shape:

1. **`NumberField` takes `size`.** Extend its props with `InputVariantProps`,
   `splitVariantProps` as TextField does, pass through to `input(variantProps)`.
   The `numberField` recipe needs a matching `size` variant for the stepper
   column: `stepper.width` is `6` and `stepperButton.fontSize` is `xs`
   (`NumberField.recipe.ts:40,50`), and the input's `paddingEnd: "6"`
   (`NumberField.tsx:88`) is paired with that width — scale them together or
   the arrows overlap the text. Take the per-size values from Chakra's
   NumberInput theme for parity.
2. **`Select` and `ComboBox` take `size`.** Add a `size` variant to the `select`
   recipe mirroring `input`'s three steps on the `trigger` slot (`h`, `px`,
   `fontSize`, `borderRadius`), so a Select still sits level with a TextField
   beside it at every size. The `indicator` is em-sized so it scales free; the
   `content`/`option` list keeps one density across sizes for now.
   `select: ["*"]` is already in `staticCss`, so nothing to add there.
3. **The label follows the control automatically** (owner decision
   2026-08-06: automatic, "unless we see repeated counter-examples"). A `size`
   variant on the `field` recipe driving `label.fontSize` (`sm`/`md`/`lg` →
   same token), threaded from the same `size` prop that hits the control
   recipe. This needs a **new `staticCss` entry** for `field` — it has none
   today because it has no variants, and the recipe comment says so.
4. **Scope: the four single-control fields** (TextField, NumberField, Select,
   ComboBox). Radio/Checkbox have their own control size scale and their
   groups' labels stay `md` until a use case appears.

**Known caveat, resolved (owner, 2026-08-06): both settings dialogs align on
`md`, so no label changes anywhere.** All labels in both dialogs are `md`
today, because Chakra's FormLabel never scaled with input size. Of the six
controls, only python-editor's "Font size" number input is `sm` (hand-rolled,
h 2rem); its two select neighbours ("Highlight code structure", "Parameter
help") and all three ml-trainer rows ("Graph colour scheme", "Graph line
style", "Graph line thickness") are `md` (h 2.5rem). The mixed control height
in python-editor's dialog is a Chakra-era accident, and a faithful port would
make the label sizes mismatch too (label-follows-size). Decision: the "Font
size" number input **grows to `md`** (h 2rem → 2.5rem, fontSize sm → md) to
match its neighbours — the one visible app delta from the size work, to
eyeball in the app-PR screenshot. Labels stay exactly as rendered today.

## Decided: `labelPosition="side"` (the settings-row question, resolved)

The question was whether a settings row is a form field or a distinct thing the
library should name. Answer: **it is a horizontal form field**, and the
exploration (2026-08-06) says the variant comes out generic, not distorted by
the settings use case:

- **The weight decision is what makes it generic.** Before it, a settings row
  differed from a normal field in layout, label weight, and label margin. With
  the default weight `normal`, only geometry is left — and "label beside
  control, label takes the free space, no bottom margin" is what a side-label
  field means anywhere.
- **Named `labelPosition`, not `orientation`.** RAC's RadioGroup already takes
  `orientation` — it lays out the _radios_, and our RadioGroup spreads props
  through, so the name is taken with a different meaning. React Spectrum
  (react-aria's own design system) calls this `labelPosition: "top" | "side"`;
  follow that.
- **Recipe shape.** A `labelPosition` variant on `field`: `top` (default) is
  today's column; `side` sets root `{ flexDirection: "row", alignItems:
"center", flexWrap: "wrap" }`, label `{ mb: 0, flex: "1 1 auto" }` (the
  `marginEnd: 3` is already in the base), and helper/error `{ width: "100%" }`
  so support text wraps to its own full-width line. No call site uses support
  text in side mode today, but define it rather than leave it undefined.
- **Free space goes to the label; the control keeps an explicit width.** All
  six existing rows work this way (`groupCss={{width: "12ch"}}`,
  `wrapperCss={{width: "28ch"}}`). Width stays a per-call-site fact via the
  existing `*Css` props; document that side mode expects one.
- **The deferred frame extraction happens at the CSS level, not in React.**
  Select's and NumberField's roots carry their own `flexDirection: column`
  from their recipes, and two recipes fighting over `flexDirection` is cascade
  roulette. So `field.root` becomes the single owner of root layout: strip
  `display`/`flexDirection`/`width` from `select.root` and `numberField.root`,
  and those fields wear `cx(field({size, labelPosition}).root, slots.root,
…)`. Each field keeps its own RAC root element, so the reason the React
  frame was deferred (it can't own the root) doesn't apply. Apps regenerate
  `styled-system` on update and nothing targets those slots' layout — owner
  has OK'd breaking changes with reasonable migrations, and this one's
  migration is "take the alpha".
- **Scope: the same four single-control fields.** RadioGroup/CheckboxGroup
  roots intentionally carry no layout and their items are direct children of
  the root; a side label there is a different design problem, unasked-for.
- **Stories.** Extend `Forms/Field chrome` with a `labelPosition` × `size`
  matrix — the #44/#45 lesson is that rendering the whole set in the state is
  what catches wrong rules in shared code.

## Decided: `NativeSelectField`, with `NativeSelect` staying exported

`labelPosition` on the RAC fields retires only one of the six settings rows
(python-editor's NumberField). The other five wrap **NativeSelect**, which has
no RAC context, so the variant never reaches them. Decision: a new labelled
field, mirroring the `Input`/`TextField` bare-control/labelled-field pairing
the library already has.

- **`NativeSelectField`**: `FieldLabel` + `NativeSelect` + helper text, wiring
  `htmlFor` and `aria-describedby` itself (`useId` fallback). Takes `label`,
  `size`, `labelPosition`, `helperText`, and the existing `wrapperCss`/`css`
  pass-throughs. No `errorMessage` in the first cut — no settings row needs
  it; add alongside an `isInvalid` story when a consumer appears
  (data-microbit-org's form-builder `SelectInput` is the likely one).
- **The bare `NativeSelect` export stays.** Eight app call sites; the six
  non-settings ones genuinely want the bare control and would fight a field
  wrapper: ml-trainer `SortInput.tsx:31` (aria-label, `hideChevron`, attached
  ButtonGroup), python-editor `AccelerometerModule.tsx:121` (aria-label in an
  HStack) and `ReferenceTopicEntry.tsx:139` (nested inside a `<label>`),
  data-microbit-org `GraphSelector.tsx:54`, `TeacherSimpleActivityPage.tsx:470`,
  `MyDataDefaultPage.tsx:422` (visually-hidden label, pill styling,
  form-builder).
- `GraphSelector.tsx:45-60` turns out to be a **seventh hand-rolled horizontal
  label** (styled.label + `me={3}` + row wrapper). Bespoke enough (pill
  variant, `lg` sizes, explicit `medium` weight) that it's an optional later
  adopter, not a driver.
- `createOptions` (duplicated between the two `SelectFormControl`s) is intl
  glue, not field chrome. It stays app-side for now; if a third copy appears,
  export it from the library (needs only a type import of `IntlShape`).

With `size` + `labelPosition` + `NativeSelectField`, a settings row is
`<NativeSelectField label={…} labelPosition="side"
wrapperCss={{width: "28ch"}}>` (plus whatever `size` the dialog settles on —
see the size caveat above) and both hand-rolled `SelectFormControl`s are
deleted — which also deletes ml-trainer's label divergence (below) rather than
patching it.

## Decided: context-free `FieldHelperText` / `FieldErrorMessage`

`FieldLabel` works outside a RAC field container; `FieldSupport` cannot,
because RAC's `Text slot="description"` and `FieldError` need the validation
context. So `FormField.tsx:57-60` hand-rolls a `<div>` with
`field().helperText` and `FormErrorMsg.tsx:18` hand-rolls
`field().errorMessage`.

Decision (2026-08-06): **export context-free presentational components** rather
than documenting the slot classes. `FieldHelperText`/`FieldErrorMessage` are
plain styled elements taking `id` + `css` (~30 lines); recipe slot names and
markup shape (the error's flex box, the helper's `display: block`) stay
private instead of becoming frozen README API. Accessibility wiring is manual
either way — the caller attaches `aria-describedby` and decides when the error
shows, as `FormErrorMsg` already does — so the options were equal on a11y and
differed only on encapsulation. `NativeSelectField` uses `FieldHelperText`
internally; `FieldSupport` keeps its RAC internals.

## App fixes queued (land with the app PRs)

- **`ml-trainer/src/components/SelectFormControl.tsx:38` lost styling its twin
  kept** (dropped `marginEnd: 3` — a long German/Welsh translation butts
  against the select; dropped `fontSize: md` is invisible off the dense
  preset). Fixed by deletion: both components are replaced by
  `NativeSelectField`, not patched.
- **`data-microbit-org/src/components/FormField.tsx` adopts `FieldLabel` +
  `FieldHelperText`/`FieldErrorMessage`** — it is the composite the exports
  were written for. Blocked on a release.
- **`data-microbit-org/src/components/FormError.tsx:9` uses `red.500`** where
  field errors use `danger.500`. Identical pixels today (`danger.500` resolves
  to `{colors.red.500}`), divergent vocabulary: the base preset reserves
  `red.*` for the recording vocabulary, so an app that re-points `danger`
  splits them. Note it is the form-level alert, not the field-level
  `FormErrorMsg.tsx` beside it — the names do not help.

## Sequencing

Apps consume published alphas (`^0.1.0-alpha.17` installed) and their
`styled-system` is gitignored, so the recipe changes regenerate cleanly with
no app action beyond taking the alpha.

1. **Commit the tree changes plus the weight change.** Same commit: playbook
   "Expected behavioural deltas" entry, and rewrite the field-chrome roadmap
   bullet (~1111) that argues against it.
2. **Size variants**: `field` size variant + `staticCss` entry; NumberField
   `size` (input + stepper scaling, Chakra parity values); `select` trigger
   size variant; thread `size` → `field({size})` in the four fields.
3. **`labelPosition`**: root-layout ownership moves to `field.root`
   (strip `select.root`/`numberField.root`); variant + prop on the four
   fields; story matrix.
4. **`NativeSelectField`** + `FieldHelperText`/`FieldErrorMessage` exports.
5. **Publish an alpha.**
6. **App PRs**:
   - python-editor: SettingsArea NumberField →
     `labelPosition="side" groupCss={{width: "12ch"}}` at the default `md`
     (four `*Css` props deleted — the whole dialog aligns on `md`, so the
     number input grows to match the selects; the size caveat has the
     detail); `SelectFormControl` deleted in favour of `NativeSelectField`.
   - ml-trainer: `SelectFormControl` deleted likewise (fixes the label
     divergence); stays `md`, so no visible size change; verify in
     German/Welsh.
   - data-microbit-org: `FormField` adopts the new exports; `FormError` →
     `danger.500`.
   - **Screenshot both settings dialogs** against production before merging.

For local work across the boundary, each app has `npm run dev:link-ui`
(symlinks the working tree and re-runs panda).

## Facts worth not re-deriving

- `fontWeights` (`base-tokens.ts:758`) is Chakra's scale: `normal` 400,
  `medium` 500, `semibold` 600, `bold` 700. `normal` is a token, not the CSS
  keyword — it compiles to `var(--font-weights-normal)`.
- No font in the family's stack has a 500 face (`Helvetica.ttc`: 300/400/700;
  `Arial.ttf`: 400/700/900), and browsers never synthesise intermediate
  weights, so `medium` and `normal` render identically on macOS and Windows.
  To see the difference locally, point `fonts.body` at
  `'"Helvetica Neue", Helvetica, Arial, sans-serif'` (has a 500) and revert
  before committing. Android/Chrome OS/most Linux get Roboto/Noto, which have
  a real Medium.
- `fontSizes.md` is 1rem in the base preset, 0.9rem under `dense-preset`
  (`× 0.9`). python-editor and classroom stack dense; ml-trainer and
  data-microbit-org do not.
- react-aria puts `data-disabled` on the field root and the control, never on
  the `Label`. Select's label renders as a `<span>`, not a `<label>`, because a
  button cannot be `<label for>`-associated — which is why `field.label` carries
  `display: block`.
- RAC's RadioGroup consumes an `orientation` prop (radio layout, arrow-key
  axis) — which is why the field variant is `labelPosition`, per React
  Spectrum.

## Decisions log (owner, 2026-08-06)

1. Settings row = horizontal field via `labelPosition="side"`, provided the
   outcome is a normal-looking primitive that fits future scenarios — the
   exploration above says it is.
2. A field's `size` drives its label automatically; revisit only on repeated
   counter-examples.
3. Both settings dialogs align on `md`: no label changes; python-editor's
   "Font size" number input grows to match the selects beside it.
4. Non-RAC helper/error: context-free components, not documented slot classes.
5. No device check for the weight change; ships on reasoning.
6. Breaking changes are acceptable where migrations are reasonable — the
   library is newly extracted and this pass is a quality-raising opportunity.
