/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Select, SelectOption, Stack } from "../src";

/**
 * Select — a listbox behind a button: pick one of a known set, no typing.
 * Forms/ComboBox is the same `select` slot recipe with a text input instead of
 * the button, for lists long enough to want filtering. One recipe behind both
 * is what stops a searchable and a non-searchable picker drifting apart.
 */
const meta = {
  title: "Forms/Select",
  component: Select,
  // Children come from the render functions; `null` just satisfies the type.
  args: { label: "Fruit", placeholder: "Select…", children: null },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
    helperText: { control: "text" },
    errorMessage: { control: "text" },
    maxHeight: { control: "number" },
    placement: {
      control: "select",
      options: ["bottom start", "bottom end", "top start", "top end"],
    },
  },
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof meta>;

const FRUIT = ["Apple", "Banana", "Cherry", "Damson", "Elderberry"];

const options = FRUIT.map((f) => (
  <SelectOption key={f} id={f}>
    {f}
  </SelectOption>
));

export const Playground: Story = {
  render: (args) => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <Select {...args}>{options}</Select>
    </Stack>
  ),
};

export const Basic: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <Select label="Fruit" placeholder="Select…">
        {options}
      </Select>
      <Select label="Disabled" placeholder="Select…" isDisabled>
        {options}
      </Select>
    </Stack>
  ),
};

/**
 * `maxHeight` is react-select's `maxMenuHeight`. It has to be a prop rather
 * than a style: RAC writes its own max-height inline while positioning, which
 * beats any class.
 */
export const LongListWithACappedHeight: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <Select label="Number" placeholder="Select…" maxHeight={160}>
        {Array.from({ length: 30 }, (_, i) => (
          <SelectOption key={i} id={String(i)}>
            Option {i + 1}
          </SelectOption>
        ))}
      </Select>
    </Stack>
  ),
};

/**
 * Per-instance overrides: `css` styles the control, `contentCss` the dropdown
 * card. An app-wide restyle belongs in an app-preset recipe variant instead
 * (classroom's rounded `classroom` variant is one).
 */
export const Overridden: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <Select
        label="Fruit"
        placeholder="Select…"
        triggerCss={{ borderRadius: "full", px: 5 }}
        contentCss={{ borderRadius: "xl" }}
      >
        {options}
      </Select>
    </Stack>
  ),
};

/**
 * Invalid state. `isInvalid` sets it directly; `isRequired` inside a form sets
 * it on submit — the second field here starts clean, goes red when you press
 * Check with nothing chosen, and clears as soon as you choose something.
 *
 * Tab through it: the focus ring beats the red border while the control is
 * focused, and hovering tints the border only while neither applies, both as a
 * TextField or NativeSelect does. Forms/Field chrome covers `errorMessage`
 * across the fields.
 */
export const Invalid: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <Select label="Fruit (invalid)" placeholder="Select…" isInvalid>
        {options}
      </Select>
      {/* Submitting empty marks the control. It needs a `name` to take part in
          form validation at all. */}
      <form onSubmit={(e) => e.preventDefault()}>
        <Stack gap={5}>
          <Select
            label="Fruit (required)"
            placeholder="Select…"
            name="fruit"
            isRequired
            errorMessage="Choose a fruit"
          >
            {options}
          </Select>
          <Button type="submit" variant="secondary">
            Check
          </Button>
        </Stack>
      </form>
    </Stack>
  ),
};
