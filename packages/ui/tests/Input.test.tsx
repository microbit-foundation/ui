/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Input, TextField } from "../src";

afterEach(cleanup);

// The base recipe has only a `size` group, but an app preset can add more
// (classroom adds `variant`). These assert the component asks the recipe for
// its variants rather than hand-picking, and that nothing leaks to the DOM.
it("puts recipe variants on the class, not on the element", () => {
  render(<Input size="lg" aria-label="n" data-testid="i" />);
  const el = screen.getByTestId("i");
  expect(el.className).toContain("input--size_lg");
  expect(el.getAttribute("size")).toBeNull();
});

it("passes native attributes through and keeps the recipe class", () => {
  render(<Input aria-label="n" data-testid="i" placeholder="p" name="f" />);
  const el = screen.getByTestId("i");
  expect(el.className).toContain("input");
  expect(el.getAttribute("placeholder")).toBe("p");
  expect(el.getAttribute("name")).toBe("f");
});

it("TextField sizes its input from the recipe too", () => {
  render(<TextField label="Name" size="lg" data-testid="tf" />);
  const el = screen.getByRole("textbox");
  expect(el.className).toContain("input--size_lg");
  expect(el.getAttribute("size")).toBeNull();
});
