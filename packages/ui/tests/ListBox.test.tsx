/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  cleanup,
  fireEvent,
  render as renderRaw,
  RenderOptions,
  screen,
} from "@testing-library/react";
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import { Checkbox, ListBox, ListBoxOption } from "../src";

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

const PEOPLE = ["Ada", "Grace", "Alan"];

it("reports every option chosen in multiple-selection mode", () => {
  const onSelectionChange = vi.fn();
  render(
    <ListBox
      aria-label="People"
      selectionMode="multiple"
      onSelectionChange={onSelectionChange}
    >
      {PEOPLE.map((name) => (
        <ListBoxOption key={name} id={name}>
          {name}
        </ListBoxOption>
      ))}
    </ListBox>,
  );
  expect(screen.getAllByRole("option")).toHaveLength(3);

  fireEvent.click(screen.getByRole("option", { name: "Ada" }));
  fireEvent.click(screen.getByRole("option", { name: "Alan" }));
  expect([...onSelectionChange.mock.calls.at(-1)![0]]).toEqual(["Ada", "Alan"]);
});

it("marks the selected option so the recipe can style it", () => {
  render(
    <ListBox
      aria-label="People"
      selectionMode="multiple"
      selectedKeys={["Grace"]}
    >
      {PEOPLE.map((name) => (
        <ListBoxOption key={name} id={name}>
          {name}
        </ListBoxOption>
      ))}
    </ListBox>,
  );
  expect(
    screen.getByRole("option", { name: "Grace" }).hasAttribute("data-selected"),
  ).toBe(true);
});

// The selectable-tile shape: the children draw the state, so the box goes.
it("Checkbox with control={false} renders only its children, told the state", () => {
  const onChange = vi.fn();
  const { container } = render(
    <Checkbox aria-label="All students" control={false} onChange={onChange}>
      {({ isSelected }) => <span>{isSelected ? "on" : "off"}</span>}
    </Checkbox>,
  );
  const box = container.querySelector('[class*="checkbox__control"]');
  expect(box).toBeNull();
  expect(screen.getByText("off")).toBeTruthy();

  fireEvent.click(screen.getByRole("checkbox"));
  expect(onChange).toHaveBeenCalledWith(true);
  expect(screen.getByText("on")).toBeTruthy();
});
