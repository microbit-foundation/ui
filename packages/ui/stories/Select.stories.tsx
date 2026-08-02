/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ComboBox, Select, SelectOption, Stack } from "../src";

const meta = {
  title: "Forms/Select",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const FRUIT = ["Apple", "Banana", "Cherry", "Damson", "Elderberry"];

const options = FRUIT.map((f) => (
  <SelectOption key={f} id={f}>
    {f}
  </SelectOption>
));

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

/** Type to filter. `emptyState` is react-select's `noOptionsMessage`. */
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
