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
  TextField,
} from "../src";

/**
 * The label/helper/error chrome — Chakra's FormControl parts — comes from two
 * shared components (`FieldLabel` and `FieldSupport`) behind every labelled
 * field, so `label`, `helperText`, `errorMessage` and `isRequired` mean the
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
    </Stack>
  ),
};

/**
 * The `size` scale across the four single-control fields. One `size` prop
 * sizes the control (via the `input`/`select` recipes) *and* its label (via
 * the `field` recipe), so the whole row scales together — Chakra's FormLabel
 * never scaled, a deliberate delta (docs/form-controls.md). A TextField and a
 * Select on the same row should sit level at every size; helper text stays
 * `sm` throughout, as Chakra's did. Radio/Checkbox groups have their own
 * control scale and are deliberately absent.
 */
export const Sizes: Story = {
  render: () => (
    <Stack gap={10} maxW="2xl">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stack key={size} gap={4} direction="row" alignItems="flex-start">
          <TextField label={`Name (${size})`} size={size} />
          <Select label="Fruit" placeholder="Select…" size={size}>
            {options}
          </Select>
          <ComboBox
            label="Fruit"
            placeholder="Start typing…"
            emptyState="No matches"
            size={size}
          >
            {options}
          </ComboBox>
          <NumberField
            label="Quantity"
            defaultValue={3}
            size={size}
            helperText="Up to a dozen"
          />
          <NativeSelectField label="Fruit" size={size}>
            {nativeOptions}
          </NativeSelectField>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * `labelPosition="side"` — the settings-row pattern: the label is a
 * preference name beside its control and absorbs the free space, so the
 * control needs an explicit width (`groupCss`/`wrapperCss`/`css` depending on
 * the field). Helper and error text drop to a full-width line below the pair
 * (submit the empty required row to see the error). Not on
 * RadioGroup/CheckboxGroup, whose roots deliberately carry no layout and
 * where RAC's `orientation` means the radios' own layout.
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
          css={{ width: "28ch" }}
        >
          {options}
        </Select>
        <ComboBox
          label="Preferred fruit"
          labelPosition="side"
          placeholder="Start typing…"
          emptyState="No matches"
          css={{ width: "28ch" }}
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
        <Select
          label="Fruit (required)"
          labelPosition="side"
          placeholder="Select…"
          name="fruit"
          isRequired
          errorMessage="Choose a fruit"
          css={{ width: "28ch" }}
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
 * `isDisabled` across the set. The label dims with the control (Chakra's
 * FormLabel `_disabled`) because the `field` recipe's label reads
 * `data-disabled` off the field root — react-aria never puts it on the label
 * itself, so a rule on the label alone silently does nothing (gotcha #45).
 * Per-field disabled stories can't show this: it is drift between fields, and
 * one undimmed label only looks wrong beside six that agree.
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
