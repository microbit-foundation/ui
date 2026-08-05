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
  NumberField,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  Stack,
  TextField,
} from "../src";

/**
 * The label/helper/error chrome — Chakra's FormControl parts — is one
 * component (`FieldSupport`) behind every labelled field, so `label`,
 * `helperText`, `errorMessage` and `isRequired` mean the same thing on
 * TextField, Select, ComboBox, NumberField, RadioGroup and CheckboxGroup.
 * react-aria wires the helper text to the control's `aria-describedby` and
 * renders the error only while the field is invalid.
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
