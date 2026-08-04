/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RiCloudLine, RiFireLine, RiSnowyLine } from "react-icons/ri";
import { Button, ComboBox, Icon, Select, SelectOption, Stack } from "../src";

const meta = {
  title: "Forms/Select",
  component: Select,
  // Children come from the render functions; `null` just satisfies the type.
  args: { label: "Fruit", placeholder: "Select…", children: null },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
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

/** A listbox behind a button: pick one of a known set, no typing. */
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
 * Type to filter. `emptyState` is react-select's `noOptionsMessage`.
 *
 * Note react-aria's default: the list opens when you *type*, not when you
 * click the field — the chevron is the click affordance. Pass
 * `menuTrigger="focus"` for react-select's behaviour, as the story below does.
 */
export const Combo: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <ComboBox
        label="Fruit"
        placeholder="Start typing…"
        emptyState="No matches"
      >
        {options}
      </ComboBox>
    </Stack>
  ),
};

/**
 * `isPopoverHidden` withholds the list entirely — for gating on a minimum
 * query length, which react-aria has no prop for. classroom uses it to make
 * students type two characters before it offers names.
 */
export const GatedOnQueryLength: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    return (
      <Stack gap={5} css={{ maxWidth: "16rem" }}>
        <ComboBox
          label="Fruit (two characters first)"
          placeholder="Start typing…"
          inputValue={query}
          onInputChange={setQuery}
          isPopoverHidden={query.length < 2}
          indicator={null}
          emptyState="No matches"
        >
          {options}
        </ComboBox>
      </Stack>
    );
  },
};

const WEATHER = [
  { value: "cloudy", label: "Cloudy", icon: RiCloudLine },
  { value: "hot", label: "Hot", icon: RiFireLine },
  { value: "snowy", label: "Snowy", icon: RiSnowyLine },
];

/**
 * `startContent` puts something before the input — an icon for the current
 * value, say. A ComboBox's control is a text input, so unlike a Select it
 * cannot otherwise show anything but text for what is chosen.
 */
export const WithAnIconForTheValue: Story = {
  render: () => {
    const [key, setKey] = useState<string | null>("cloudy");
    const [query, setQuery] = useState("Cloudy");
    const chosen = WEATHER.find((w) => w.value === key);
    return (
      <Stack gap={5} css={{ maxWidth: "16rem" }}>
        <ComboBox
          label="Weather"
          placeholder="Select…"
          menuTrigger="focus"
          selectedKey={key}
          inputValue={query}
          onInputChange={setQuery}
          onSelectionChange={(k) => {
            setKey(k as string);
            const w = WEATHER.find((x) => x.value === k);
            if (w) {
              setQuery(w.label);
            }
          }}
          startContent={
            chosen ? <Icon as={chosen.icon} aria-hidden /> : undefined
          }
        >
          {WEATHER.map((w) => (
            <SelectOption key={w.value} id={w.value} textValue={w.label}>
              <Icon as={w.icon} aria-hidden />
              {w.label}
            </SelectOption>
          ))}
        </ComboBox>
      </Stack>
    );
  },
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
        css={{ borderRadius: "full", px: 5 }}
        contentCss={{ borderRadius: "xl" }}
      >
        {options}
      </Select>
    </Stack>
  ),
};

/**
 * Invalid state. `isInvalid` sets it directly; `isRequired` inside a form sets
 * it on submit — the bottom pair here, which start clean, go red when you press
 * Check with nothing chosen, and clear as soon as you choose something.
 *
 * Tab through them: the focus ring beats the red border while a control is
 * focused, and hovering tints the border only while neither applies, both as a
 * TextField or NativeSelect does. Note that red is the *only* signal a Select
 * gives — unlike TextField it has no `errorMessage`, so anything explaining the
 * error has to come from the app for now (#41).
 */
export const Invalid: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <Select label="Fruit (invalid)" placeholder="Select…" isInvalid>
        {options}
      </Select>
      <ComboBox label="Fruit (invalid)" placeholder="Start typing…" isInvalid>
        {options}
      </ComboBox>
      {/* Submitting empty marks both controls. They need a `name` to take part
          in form validation at all. */}
      <form onSubmit={(e) => e.preventDefault()}>
        <Stack gap={5}>
          <Select
            label="Fruit (required)"
            placeholder="Select…"
            name="a"
            isRequired
          >
            {options}
          </Select>
          {/* `isRequired`, not a `validate` rule: react-aria displays a
              ComboBox's custom validation a step behind, so it goes red while
              you are still typing and stays red after you have picked
              something, until blur. */}
          <ComboBox
            label="Fruit (required)"
            placeholder="Start typing…"
            name="b"
            isRequired
          >
            {options}
          </ComboBox>
          <Button type="submit" variant="secondary">
            Check
          </Button>
        </Stack>
      </form>
    </Stack>
  ),
};
