/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ComboBox, SelectOption } from "../src";

afterEach(cleanup);

interface School {
  id: string;
  name: string;
}

// Dynamic collections are the async-lookup shape (data-microbit-org's school
// search): `items` holds externally loaded results and the children render
// function maps each to an option. react-aria does no text filtering of its
// own over a controlled `items`, so what the server returned is what shows.
it("renders a dynamic collection from items + a render function", () => {
  const schools: School[] = [
    { id: "1", name: "Springfield Primary" },
    { id: "2", name: "Shelbyville Academy" },
  ];
  render(
    <ComboBox<School> label="School" items={schools} menuTrigger="focus">
      {(school) => <SelectOption id={school.id}>{school.name}</SelectOption>}
    </ComboBox>,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("option", { name: "Springfield Primary" }));
  expect(screen.getByRole("option", { name: "Shelbyville Academy" }));
});

it("shows the empty state for an empty dynamic collection", () => {
  render(
    <ComboBox<School>
      label="School"
      items={[]}
      emptyState="Type at least 3 characters"
      menuTrigger="focus"
    >
      {(school) => <SelectOption id={school.id}>{school.name}</SelectOption>}
    </ComboBox>,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Type at least 3 characters")).not.toBeNull();
});
