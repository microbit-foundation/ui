/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useAsyncList } from "react-aria-components";
import { RiCloudLine, RiFireLine, RiSnowyLine } from "react-icons/ri";
import { Button, ComboBox, Icon, SelectOption, Stack } from "../src";

/**
 * ComboBox — a text input that filters a listbox, for choosing one of a known
 * set where typing to narrow it down is the point. Forms/Select is the same
 * `select` recipe with a button instead of an input; use that where the list is
 * short enough to just pick from.
 *
 * Two react-select differences this replaces: react-aria filters on each
 * option's `textValue` rather than its label, and closes the list on selection.
 */
const meta = {
  title: "Forms/ComboBox",
  component: ComboBox,
  // Children come from the render functions; `null` just satisfies the type.
  args: { label: "Fruit", placeholder: "Start typing…", children: null },
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
} satisfies Meta<typeof ComboBox>;
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
      <ComboBox {...args} emptyState="No matches">
        {options}
      </ComboBox>
    </Stack>
  ),
};

/**
 * Type to filter. `emptyState` is react-select's `noOptionsMessage`.
 *
 * Note react-aria's default: the list opens when you *type*, not when you click
 * the field — the chevron is the click affordance. Pass `menuTrigger="focus"`
 * for react-select's behaviour, as the icon story below does.
 */
export const Basic: Story = {
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
 * `isPopoverHidden` withholds the list entirely — for gating on a minimum query
 * length, which react-aria has no prop for. classroom uses it to make students
 * type two characters before it offers names.
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

interface School {
  id: string;
  name: string;
}

const SCHOOLS: School[] = [
  { id: "1", name: "Springfield Primary School" },
  { id: "2", name: "Springfield High School" },
  { id: "3", name: "Shelbyville Academy" },
  { id: "4", name: "Ogdenville Community School" },
  { id: "5", name: "North Haverbrook Primary" },
];

// Stands in for the lookup endpoint: it does the filtering, and takes its time
// over it. Superseded loads need no cancelling here — useAsyncList discards the
// results of any load it has already replaced.
const searchSchools = (query: string): Promise<School[]> =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          SCHOOLS.filter((s) =>
            s.name.toLowerCase().includes(query.toLowerCase()),
          ),
        ),
      600,
    );
  });

/**
 * An async lookup, which is data-microbit-org's school search: a dynamic
 * collection — the `items` prop plus render-function children — over results
 * loaded outside the component. react-aria does no text filtering of its own
 * once `items` is controlled, so what the server returned is what shows;
 * `useAsyncList` (from react-aria-components) holds the query and the results.
 *
 * The two supporting props matter as much as the collection: `emptyState`
 * doubles as the loading message, and `isPopoverHidden` keeps the list shut
 * until the query is worth a request.
 */
export const AsyncLookup: Story = {
  render: () => {
    const list = useAsyncList<School>({
      async load({ filterText }) {
        const query = filterText ?? "";
        return { items: query.length < 3 ? [] : await searchSchools(query) };
      },
    });
    const query = list.filterText;
    return (
      <Stack gap={5} css={{ maxWidth: "20rem" }}>
        <ComboBox<School>
          label="School"
          placeholder="Type at least three letters…"
          helperText="Try “spring”, “ville” or “haverbrook”"
          items={list.items}
          inputValue={query}
          onInputChange={list.setFilterText}
          isPopoverHidden={query.length < 3}
          emptyState={list.isLoading ? "Searching…" : "No matches"}
        >
          {(school) => (
            <SelectOption id={school.id}>{school.name}</SelectOption>
          )}
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
 * Invalid state. `isInvalid` sets it directly; `isRequired` inside a form sets
 * it on submit — the second field here starts clean, goes red when you press
 * Check with nothing chosen, and clears as soon as you choose something.
 *
 * Tab through them: the focus ring beats the red border while a control is
 * focused, and hovering tints the border only while neither applies, as a
 * TextField does. Forms/Field chrome covers `errorMessage` across the fields.
 */
export const Invalid: Story = {
  render: () => (
    <Stack gap={5} css={{ maxWidth: "16rem" }}>
      <ComboBox label="Fruit (invalid)" placeholder="Start typing…" isInvalid>
        {options}
      </ComboBox>
      <form onSubmit={(e) => e.preventDefault()}>
        <Stack gap={5}>
          {/* `isRequired`, not a `validate` rule: react-aria displays a
              ComboBox's custom validation a step behind, so it goes red while
              you are still typing and stays red after you have picked
              something, until blur. A `name` is needed to take part in form
              validation at all. */}
          <ComboBox
            label="Fruit (required)"
            placeholder="Start typing…"
            name="fruit"
            isRequired
            errorMessage="Choose a fruit"
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
