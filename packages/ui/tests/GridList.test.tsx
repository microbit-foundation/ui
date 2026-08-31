/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Button, GridList, GridListItem } from "../src";

afterEach(cleanup);

const PEOPLE = ["Ada", "Grace", "Alan"];

const renderList = (props = {}, item?: (name: string) => React.ReactNode) =>
  render(
    <GridList aria-label="People" selectionMode="single" {...props}>
      {PEOPLE.map((name) => (
        <GridListItem key={name} id={name} textValue={name}>
          {item ? item(name) : name}
        </GridListItem>
      ))}
    </GridList>,
  );

it("renders a row per item and reports the one selected", () => {
  const onSelectionChange = vi.fn();
  renderList({ onSelectionChange });
  expect(screen.getAllByRole("row")).toHaveLength(3);

  fireEvent.click(screen.getByRole("row", { name: "Grace" }));
  // react-aria's Selection is a Set subclass carrying anchor/current keys, so
  // compare the contents rather than the object.
  expect([...(onSelectionChange.mock.calls[0][0] as Set<string>)]).toEqual(["Grace"]);
});

it("marks the selected row so the recipe can style it", () => {
  renderList({ selectedKeys: ["Alan"] });
  expect(
    screen.getByRole("row", { name: "Alan" }).hasAttribute("data-selected"),
  ).toBe(true);
});

// The reason a roster is a grid rather than a listbox: a listbox option is a
// leaf, so a button inside one is unreachable.
it("keeps a button inside a row operable", () => {
  const onPress = vi.fn();
  renderList({}, (name) => (
    <Button onPress={onPress} aria-label={`Edit ${name}`}>
      Edit
    </Button>
  ));
  fireEvent.click(screen.getByRole("button", { name: "Edit Grace" }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
