/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { field } from "styled-system/recipes";
import { afterEach, expect, it } from "vitest";
import { NativeSelectField } from "../src";

afterEach(cleanup);

// NativeSelectField wires by hand what react-aria wires for the RAC fields —
// label association, aria-describedby, the root's data-disabled — so each
// piece gets asserted, not assumed.

const options = (
  <>
    <option value="a">A</option>
    <option value="b">B</option>
  </>
);

it("associates the label with the select", () => {
  render(<NativeSelectField label="Fruit">{options}</NativeSelectField>);
  expect(screen.getByLabelText("Fruit").tagName).toBe("SELECT");
});

it("keeps a caller-supplied id for the association", () => {
  render(
    <NativeSelectField label="Fruit" id="fruit">
      {options}
    </NativeSelectField>,
  );
  expect(screen.getByLabelText("Fruit").id).toBe("fruit");
});

it("wires helper text to aria-describedby, merging any existing value", () => {
  render(
    <NativeSelectField
      label="Fruit"
      helperText="Pick one"
      aria-describedby="external"
    >
      {options}
    </NativeSelectField>,
  );
  const describedBy =
    screen.getByLabelText("Fruit").getAttribute("aria-describedby") ?? "";
  const ids = describedBy.split(/\s+/).filter(Boolean);
  expect(ids).toContain("external");
  const texts = ids.map((id) => document.getElementById(id)?.textContent);
  expect(texts).toContain("Pick one");
});

it("stamps data-disabled on the root so the label dims", () => {
  const { container } = render(
    <NativeSelectField label="Fruit" disabled>
      {options}
    </NativeSelectField>,
  );
  expect(container.querySelector("div")?.hasAttribute("data-disabled")).toBe(
    true,
  );
});

it("threads size and labelPosition through the chrome", () => {
  const { container } = render(
    <NativeSelectField
      label="Fruit"
      helperText="H"
      size="sm"
      labelPosition="side"
    >
      {options}
    </NativeSelectField>,
  );
  const side = field({ size: "sm", labelPosition: "side" });
  expect(container.querySelector("div")?.className).toContain(side.root);
  expect(screen.getByText("Fruit").className).toContain(side.label);
  // Helper text is deliberately size-independent (`sm` chrome at every field
  // size), so it renders at the default size's classes.
  expect(screen.getByText("H").className).toContain(
    field({ labelPosition: "side" }).helperText,
  );
});

it("adds the asterisk when required", () => {
  render(
    <NativeSelectField label="Fruit" required>
      {options}
    </NativeSelectField>,
  );
  expect(screen.getByText("*")).not.toBeNull();
});
