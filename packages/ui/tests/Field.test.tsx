/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  cleanup,
  render as renderRaw,
  RenderOptions,
  screen,
} from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { css } from "styled-system/css";
import { field, input, switchRecipe } from "styled-system/recipes";
import { afterEach, expect, it } from "vitest";
import {
  Checkbox,
  CheckboxGroup,
  ComboBox,
  NativeSelectField,
  NumberField,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  Switch,
  TextField,
} from "../src";

afterEach(cleanup);

// Some components' built-in labels are react-intl messages (README
// "Strings"); English renders from defaultMessage, so no catalog is needed.
const render = (ui: ReactNode, options?: RenderOptions) =>
  renderRaw(ui, {
    wrapper: ({ children }) => (
      <IntlProvider locale="en">{children}</IntlProvider>
    ),
    ...options,
  });

// The field chrome (label/required indicator/helper text/error message —
// Chakra's FormControl parts) was generalised out of TextField for
// data-microbit-org's forms, which attach it to selects, radio groups and
// checkbox groups too. These assert each field type wires it through
// react-aria: helper text reaches aria-describedby, the error renders only
// while invalid.

it("TextField keeps its helper and error wiring after the extraction", () => {
  render(
    <TextField
      label="Name"
      isRequired
      isInvalid
      helperText="Your full name"
      errorMessage="Required"
    />,
  );
  const input = screen.getByRole("textbox");
  const describedBy = input.getAttribute("aria-describedby") ?? "";
  const texts = describedBy
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent);
  expect(texts).toContain("Your full name");
  expect(texts).toContain("Required");
  expect(screen.getByText("*")).not.toBeNull();
});

it("Select renders helper text, and its error only when invalid", () => {
  const options = (
    <>
      <SelectOption id="a">A</SelectOption>
      <SelectOption id="b">B</SelectOption>
    </>
  );
  const { rerender } = render(
    <Select label="Choice" helperText="Pick one" errorMessage="Required">
      {options}
    </Select>,
  );
  expect(screen.getByText("Pick one")).not.toBeNull();
  expect(screen.queryByText("Required")).toBeNull();
  rerender(
    <Select
      label="Choice"
      isInvalid
      helperText="Pick one"
      errorMessage="Required"
    >
      {options}
    </Select>,
  );
  expect(screen.getByText("Required")).not.toBeNull();
});

it("RadioGroup renders the chrome around its radios", () => {
  render(
    <RadioGroup
      label="Size"
      isRequired
      isInvalid
      helperText="Choose a size"
      errorMessage="Required"
    >
      <Radio value="s">Small</Radio>
      <Radio value="m">Medium</Radio>
    </RadioGroup>,
  );
  const group = screen.getByRole("radiogroup", { name: /Size/ });
  expect(group).not.toBeNull();
  expect(screen.getAllByRole("radio")).toHaveLength(2);
  expect(screen.getByText("Choose a size")).not.toBeNull();
  expect(screen.getByText("Required")).not.toBeNull();
  expect(screen.getByText("*")).not.toBeNull();
});

it("CheckboxGroup shares one value array and renders the chrome", () => {
  render(
    <CheckboxGroup
      label="Age groups"
      value={["7-11"]}
      helperText="All that apply"
    >
      <Checkbox value="4-7">4–7</Checkbox>
      <Checkbox value="7-11">7–11</Checkbox>
    </CheckboxGroup>,
  );
  const group = screen.getByRole("group", { name: /Age groups/ });
  expect(group).not.toBeNull();
  const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
  expect(boxes.map((b) => b.checked)).toEqual([false, true]);
  expect(screen.getByText("All that apply")).not.toBeNull();
});

it("NumberField renders helper text below the group", () => {
  render(
    <NumberField label="Count" helperText="Whole numbers" defaultValue={3} />,
  );
  expect(screen.getByText("Whole numbers")).not.toBeNull();
  const input = screen.getByRole("textbox");
  const describedBy = input.getAttribute("aria-describedby") ?? "";
  expect(
    describedBy
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent),
  ).toContain("Whole numbers");
});

// Every labelled field, for the two assertions below.
const fields: [string, ReactElement][] = [
  ["TextField", <TextField label="L" />],
  [
    "Select",
    <Select label="L">
      <SelectOption id="a">A</SelectOption>
    </Select>,
  ],
  [
    "ComboBox",
    <ComboBox label="L">
      <SelectOption id="a">A</SelectOption>
    </ComboBox>,
  ],
  ["NumberField", <NumberField label="L" />],
  [
    "RadioGroup",
    <RadioGroup label="L">
      <Radio value="s">Small</Radio>
    </RadioGroup>,
  ],
  [
    "CheckboxGroup",
    <CheckboxGroup label="L">
      <Checkbox value="a">A</Checkbox>
    </CheckboxGroup>,
  ],
];

it.each(fields)("%s styles its label from the field recipe", (_name, el) => {
  render(el);
  expect(screen.getByText("L").className).toContain(field().label);
});

// The four fields with a `size` prop, for the label-follows-control assertion.
const sizedFields: [string, ReactElement][] = [
  ["TextField", <TextField label="L" size="sm" />],
  [
    "Select",
    <Select label="L" size="sm">
      <SelectOption id="a">A</SelectOption>
    </Select>,
  ],
  [
    "ComboBox",
    <ComboBox label="L" size="sm">
      <SelectOption id="a">A</SelectOption>
    </ComboBox>,
  ],
  ["NumberField", <NumberField label="L" size="sm" />],
];

it.each(sizedFields)("%s's size reaches its label", (_name, el) => {
  render(el);
  expect(screen.getByText("L").className).toContain(
    field({ size: "sm" }).label,
  );
});

it("NumberField's size reaches its input", () => {
  render(<NumberField label="L" size="sm" />);
  expect(screen.getByRole("textbox").className).toContain(
    input({ size: "sm" }),
  );
});

// labelPosition takes the same four fields; the variant has to land on the
// root (row layout), the label (flex/margin) and the support text (the
// full-width wrap), or the row silently renders as a column.
const sideFields: [string, ReactElement][] = [
  ["TextField", <TextField label="L" labelPosition="side" helperText="H" />],
  [
    "Select",
    <Select label="L" labelPosition="side" helperText="H">
      <SelectOption id="a">A</SelectOption>
    </Select>,
  ],
  [
    "ComboBox",
    <ComboBox label="L" labelPosition="side" helperText="H">
      <SelectOption id="a">A</SelectOption>
    </ComboBox>,
  ],
  [
    "NumberField",
    <NumberField label="L" labelPosition="side" helperText="H" />,
  ],
];

it.each(sideFields)(
  "%s's labelPosition reaches root, label and helper",
  (_name, el) => {
    const { container } = render(el);
    const side = field({ labelPosition: "side" });
    // querySelector, not firstElementChild: RAC's Select puts a <template>
    // ahead of its root div.
    expect(container.querySelector("div")?.className).toContain(side.root);
    expect(screen.getByText("L").className).toContain(side.label);
    expect(screen.getByText("H").className).toContain(side.helperText);
  },
);

// Every labelled field takes labelCss (data-microbit-org's bold-lg dialog
// labels are the motivating override).
const bold = { fontWeight: "bold" } as const;
const labelCssFields: [string, ReactElement][] = [
  ["TextField", <TextField label="L" labelCss={bold} />],
  [
    "Select",
    <Select label="L" labelCss={bold}>
      <SelectOption id="a">A</SelectOption>
    </Select>,
  ],
  [
    "ComboBox",
    <ComboBox label="L" labelCss={bold}>
      <SelectOption id="a">A</SelectOption>
    </ComboBox>,
  ],
  ["NumberField", <NumberField label="L" labelCss={bold} />],
  [
    "NativeSelectField",
    <NativeSelectField label="L" labelCss={bold}>
      <option value="a">A</option>
    </NativeSelectField>,
  ],
  [
    "RadioGroup",
    <RadioGroup label="L" labelCss={bold}>
      <Radio value="s">Small</Radio>
    </RadioGroup>,
  ],
  [
    "CheckboxGroup",
    <CheckboxGroup label="L" labelCss={bold}>
      <Checkbox value="a">A</Checkbox>
    </CheckboxGroup>,
  ],
];

it.each(labelCssFields)("%s's labelCss reaches its label", (_name, el) => {
  render(el);
  expect(screen.getByText("L").className).toContain(css(bold));
});

// The standalone toggles carry the same helper-text chrome, wired by hand —
// both settings dialogs used to hand-roll a Text underneath, which never
// reached aria-describedby.
const toggles: [string, ReactElement, string][] = [
  ["Checkbox", <Checkbox helperText="H">L</Checkbox>, "checkbox"],
  ["Switch", <Switch helperText="H">L</Switch>, "switch"],
];

it.each(toggles)(
  "%s wires helperText to aria-describedby",
  (_name, el, role) => {
    render(el);
    const describedBy =
      screen.getByRole(role).getAttribute("aria-describedby") ?? "";
    const texts = describedBy
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent);
    expect(texts).toContain("H");
    expect(screen.getByText("H").className).toContain(field().helperText);
  },
);

it("Switch labelPosition=start reaches root and label", () => {
  render(
    <Switch labelPosition="start" helperText="H">
      L
    </Switch>,
  );
  const start = switchRecipe({ labelPosition: "start" });
  const root = screen.getByText("L").closest("label");
  expect(root?.className).toContain(start.root);
  expect(screen.getByText("L").className).toContain(start.label);
});
