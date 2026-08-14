/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  NativeSelectField,
  NumberField,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  Stack,
  Switch,
  Text,
  TextField,
} from "../src";

/**
 * The label/helper/error chrome comes from two shared components
 * (`FieldLabel` and `FieldSupport`) behind every labelled field, so
 * `label`, `helperText`, `errorMessage` and `isRequired` mean the
 * same thing on TextField, Select, ComboBox, NumberField, RadioGroup and
 * CheckboxGroup. react-aria wires the helper text to the control's
 * `aria-describedby` and renders the error only while the field is invalid.
 * NativeSelectField carries the same chrome around a plain `<select>` (native
 * `required`/`disabled` props there), wiring by hand what RAC does for the
 * rest.
 *
 * Each field's own page covers its behaviour; this page is the chrome across
 * the set, where drift between them shows up.
 */
const meta = {
  title: "Forms/Field chrome",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const FRUIT = ["Apple", "Banana", "Cherry", "Damson"];

const options = FRUIT.map((f) => (
  <SelectOption key={f} id={f}>
    {f}
  </SelectOption>
));

const nativeOptions = FRUIT.map((f) => (
  <option key={f} value={f}>
    {f}
  </option>
));

/** Helper text below the control, and the asterisk `isRequired` adds. */
export const HelperText: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <TextField label="Name" helperText="As shown on the certificate" />
      <Select
        label="Fruit"
        placeholder="Select…"
        helperText="Whatever is in season"
        isRequired
      >
        {options}
      </Select>
      <ComboBox
        label="Fruit"
        placeholder="Start typing…"
        helperText="Type to narrow the list"
        emptyState="No matches"
      >
        {options}
      </ComboBox>
      <NumberField
        label="Quantity"
        defaultValue={3}
        minValue={0}
        helperText="Up to a dozen"
        groupCss={{ width: "32" }}
      />
      {/* Native props here (`required`/`disabled`), not RAC's isRequired/
          isDisabled — the control is a plain <select>. */}
      <NativeSelectField
        label="Fruit (native)"
        helperText="The platform's own picker"
        required
      >
        {nativeOptions}
      </NativeSelectField>
      <RadioGroup label="Device" defaultValue="v2" helperText="V2 has a mic">
        <Stack gap={3}>
          <Radio value="v1">micro:bit V1</Radio>
          <Radio value="v2">micro:bit V2</Radio>
        </Stack>
      </RadioGroup>
      <CheckboxGroup
        label="Sensors to log"
        defaultValue={["temperature"]}
        helperText="At least one"
        isRequired
      >
        <Stack gap={3}>
          <Checkbox value="temperature">Temperature</Checkbox>
          <Checkbox value="light">Light level</Checkbox>
        </Stack>
      </CheckboxGroup>
      {/* Standalone toggles take helperText too — the settings-dialog
          pattern both apps hand-rolled with a Text underneath, which never
          reached aria-describedby. */}
      <Checkbox helperText="Warnings appear as you type, not on flashing">
        Warn about V2-only features
      </Checkbox>
      <Switch helperText="Anonymous usage data; no code is collected">
        Allow analytics
      </Switch>
    </Stack>
  ),
};

const YEARS = ["Year 7", "Year 8", "Year 9"];
const SCHOOLS = [
  "Abbey Road Primary",
  "Bishops Park High",
  "Castle Hill Academy",
];
const LANGUAGES = ["English", "Cymraeg", "Français", "Deutsch"];

/**
 * The `size` scale, the same small form at each step. One `size` prop sizes
 * the control (via the `input`/`select` recipes) *and* its label (via the
 * `field` recipe): the label follows the field's size so the whole form
 * scales together. The first row pairs a TextField with a Select because the
 * two are sized by different recipes: if the ladders drift, they stop sitting
 * level. Helper text stays `sm` throughout. Radio/Checkbox groups have their
 * own control scale and are deliberately absent.
 */
export const Sizes: Story = {
  render: () => (
    <Stack direction="row" gap={8} alignItems="flex-start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stack key={size} gap={5} width="64">
          <Text fontWeight="semibold" color="gray.600">
            size="{size}"
          </Text>
          <Stack direction="row" gap={3}>
            <TextField label="First name" size={size} />
            <Select label="Year" placeholder="Year" size={size}>
              {YEARS.map((y) => (
                <SelectOption key={y} id={y}>
                  {y}
                </SelectOption>
              ))}
            </Select>
          </Stack>
          <ComboBox
            label="School"
            placeholder="Start typing…"
            emptyState="No matches"
            size={size}
          >
            {SCHOOLS.map((s) => (
              <SelectOption key={s} id={s}>
                {s}
              </SelectOption>
            ))}
          </ComboBox>
          <NativeSelectField label="Language" size={size}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </NativeSelectField>
          <NumberField
            label="Students in class"
            defaultValue={24}
            minValue={1}
            maxValue={30}
            helperText="Up to 30"
            size={size}
          />
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * `labelPosition="side"` — the settings-row pattern: the label is a
 * preference name beside its control and absorbs the free space, so the
 * control needs an explicit width (`groupCss`/`wrapperCss`/`triggerCss`
 * depending on the field). Helper and error text drop to a full-width line
 * below the pair (submit the empty required row to see the error). Switch's
 * counterpart is `labelPosition="start"`. Not on RadioGroup/CheckboxGroup,
 * whose roots deliberately carry no layout and where RAC's `orientation`
 * means the radios' own layout.
 */
export const SideLabels: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()}>
      <Stack gap={5} maxW="md">
        <NumberField
          label="Font size"
          labelPosition="side"
          defaultValue={16}
          minValue={8}
          groupCss={{ width: "12ch" }}
        />
        <Select
          label="Highlight code structure"
          labelPosition="side"
          defaultSelectedKey="Apple"
          triggerCss={{ width: "28ch" }}
        >
          {options}
        </Select>
        {/* Translation-length label: must wrap beside the control, not push
            it onto its own line (the label's flex basis is 0 for this). */}
        <Select
          label="Highlight code structure when the translation runs long"
          labelPosition="side"
          defaultSelectedKey="Apple"
          triggerCss={{ width: "28ch" }}
        >
          {options}
        </Select>
        <ComboBox
          label="Preferred fruit"
          labelPosition="side"
          placeholder="Start typing…"
          emptyState="No matches"
          triggerCss={{ width: "28ch" }}
        >
          {options}
        </ComboBox>
        <NativeSelectField
          label="Parameter help (native)"
          labelPosition="side"
          wrapperCss={{ width: "28ch" }}
        >
          {nativeOptions}
        </NativeSelectField>
        <NumberField
          label="Simulated devices"
          labelPosition="side"
          defaultValue={2}
          groupCss={{ width: "12ch" }}
          helperText="Helper text takes a full-width line below the row"
        />
        {/* The toggle counterpart: label first, switch at the row's end
            (values are start/end, not top/side — a switch's label is already
            beside it). */}
        <Switch
          labelPosition="start"
          helperText="Anonymous usage data; no code is collected"
        >
          Allow analytics
        </Switch>
        <Select
          label="Fruit (required)"
          labelPosition="side"
          placeholder="Select…"
          name="fruit"
          isRequired
          errorMessage="Choose a fruit"
          triggerCss={{ width: "28ch" }}
        >
          {options}
        </Select>
        <Button type="submit" variant="secondary" css={{ alignSelf: "start" }}>
          Check
        </Button>
      </Stack>
    </form>
  ),
};

/**
 * `isDisabled` across the set. The label dims with the control because the
 * `field` recipe's label reads `data-disabled` off the field root —
 * react-aria never puts it on the label itself, so a rule on the label alone
 * silently does nothing. Per-field disabled stories can't show this: it is
 * drift between fields, and one undimmed label only looks wrong beside six
 * that agree.
 */
export const Disabled: Story = {
  render: () => (
    <Stack gap={6} maxW="md">
      <TextField label="Name" defaultValue="Ada" isDisabled />
      <Select label="Fruit" placeholder="Select…" isDisabled>
        {options}
      </Select>
      <ComboBox
        label="Fruit"
        placeholder="Start typing…"
        emptyState="No matches"
        isDisabled
      >
        {options}
      </ComboBox>
      <NumberField
        label="Quantity"
        defaultValue={3}
        groupCss={{ width: "32" }}
        isDisabled
      />
      <NativeSelectField label="Fruit (native)" disabled>
        {nativeOptions}
      </NativeSelectField>
      <RadioGroup label="Device" defaultValue="v2" isDisabled>
        <Stack gap={3}>
          <Radio value="v1">micro:bit V1</Radio>
          <Radio value="v2">micro:bit V2</Radio>
        </Stack>
      </RadioGroup>
      <CheckboxGroup
        label="Sensors to log"
        defaultValue={["temperature"]}
        isDisabled
      >
        <Stack gap={3}>
          <Checkbox value="temperature">Temperature</Checkbox>
          <Checkbox value="light">Light level</Checkbox>
        </Stack>
      </CheckboxGroup>
    </Stack>
  ),
};

/**
 * Errors on submit. Each field needs a `name` to take part in the form's
 * validation at all; `isRequired` then fails it while empty and react-aria
 * fills the error slot with `errorMessage`. Press Check with the form empty,
 * and note the error replaces nothing — helper text stays put beside it.
 */
export const ValidationOnSubmit: Story = {
  render: () => (
    <form onSubmit={(e) => e.preventDefault()}>
      <Stack gap={6} maxW="md">
        <TextField
          label="Name"
          name="name"
          isRequired
          errorMessage="Tell us your name"
        />
        <Select
          label="Fruit"
          placeholder="Select…"
          name="fruit"
          isRequired
          errorMessage="Choose a fruit"
        >
          {options}
        </Select>
        {/* `isRequired` rather than a `validate` rule: react-aria reports a
            ComboBox's custom validation a step behind (see Forms/ComboBox's
            Invalid story). */}
        <ComboBox
          label="Fruit (searchable)"
          placeholder="Start typing…"
          name="fruit-combo"
          isRequired
          emptyState="No matches"
          errorMessage="Choose a fruit"
        >
          {options}
        </ComboBox>
        <NumberField
          label="Quantity"
          name="quantity"
          isRequired
          minValue={1}
          errorMessage="How many?"
          groupCss={{ width: "32" }}
        />
        <RadioGroup
          label="Device"
          name="device"
          isRequired
          errorMessage="Pick a device"
        >
          <Stack gap={3}>
            <Radio value="v1">micro:bit V1</Radio>
            <Radio value="v2">micro:bit V2</Radio>
          </Stack>
        </RadioGroup>
        <CheckboxGroup
          label="Sensors to log"
          name="sensors"
          isRequired
          errorMessage="Choose at least one sensor"
        >
          <Stack gap={3}>
            <Checkbox value="temperature">Temperature</Checkbox>
            <Checkbox value="light">Light level</Checkbox>
          </Stack>
        </CheckboxGroup>
        <Button type="submit" variant="secondary" css={{ alignSelf: "start" }}>
          Check
        </Button>
      </Stack>
    </form>
  ),
};
