/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  Checkbox,
  CheckboxGroup,
  NumberField,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  TextField,
} from "../src";

afterEach(cleanup);

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
