/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ComboBox, Select, SelectOption } from "../src";

afterEach(cleanup);

const FRUIT = ["Apple", "Banana", "Cherry"];

const renderSelect = (props = {}) =>
  render(
    <Select aria-label="Fruit" placeholder="Pick one" {...props}>
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </Select>,
  );

it("shows the placeholder until something is chosen, then the choice", () => {
  const onSelectionChange = vi.fn();
  renderSelect({ onSelectionChange });
  const trigger = screen.getByRole("button");
  expect(trigger.textContent).toContain("Pick one");

  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("option", { name: "Banana" }));
  expect(onSelectionChange).toHaveBeenCalledWith("Banana");
  expect(screen.getByRole("button").textContent).toContain("Banana");
});

it("gives its options the parent's slot classes, so an app variant reaches them", () => {
  renderSelect();
  fireEvent.click(screen.getByRole("button"));
  for (const opt of screen.getAllByRole("option")) {
    expect(opt.className).toContain("select__option");
  }
});

it("ComboBox filters as you type and reports the selection", () => {
  const onSelectionChange = vi.fn();
  render(
    <ComboBox aria-label="Fruit" onSelectionChange={onSelectionChange}>
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </ComboBox>,
  );
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: "an" } });
  const names = screen.getAllByRole("option").map((o) => o.textContent);
  expect(names).toEqual(["Banana"]);

  fireEvent.click(screen.getByRole("option", { name: "Banana" }));
  expect(onSelectionChange).toHaveBeenCalledWith("Banana");
});

it("ComboBox can withhold the popover entirely", () => {
  const Probe = () => {
    const [q, setQ] = useState("");
    return (
      <ComboBox
        aria-label="Fruit"
        inputValue={q}
        onInputChange={setQ}
        // The gate classroom's name field uses: no list until 2 characters.
        isPopoverHidden={q.length < 2}
      >
        {FRUIT.map((f) => (
          <SelectOption key={f} id={f}>
            {f}
          </SelectOption>
        ))}
      </ComboBox>
    );
  };
  render(<Probe />);
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: "a" } });
  expect(screen.queryAllByRole("option")).toHaveLength(0);
  fireEvent.change(input, { target: { value: "ap" } });
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
    "Apple",
  ]);
});

it("ComboBox shows an empty state and can drop the indicator", () => {
  render(
    <ComboBox aria-label="Fruit" indicator={null} emptyState="Nothing found">
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </ComboBox>,
  );
  // indicator={null} means no toggle button beside the input.
  expect(screen.queryAllByRole("button")).toHaveLength(0);
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: "zzz" } });
  expect(screen.getByText("Nothing found")).toBeDefined();
});

it("drops the chevron when asked, rather than silently keeping it", () => {
  const { container } = render(
    <Select aria-label="Fruit" indicator={null}>
      <SelectOption id="a">Apple</SelectOption>
    </Select>,
  );
  expect(container.querySelector('[class*="select__indicator"]')).toBeNull();
});
