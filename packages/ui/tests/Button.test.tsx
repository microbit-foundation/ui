/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it } from "vitest";
import { Button } from "../src";

afterEach(cleanup);

it("renders without an IntlProvider when not loading", () => {
  // Test renders commonly lack the provider; only a loading button may
  // require it (the spinner's localized label).
  render(<Button>Save</Button>);
  expect(screen.getByRole("button", { name: "Save" })).not.toBeNull();
});

it("isLoading swaps the label for a spinner and disables the button", () => {
  render(
    <IntlProvider locale="en">
      <Button isLoading>Save</Button>
    </IntlProvider>,
  );
  const button = screen.getByRole("button");
  expect(button.textContent).not.toContain("Save");
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(button.getAttribute("data-loading")).toBe("true");
  expect(screen.getByRole("status", { name: "Loading" })).not.toBeNull();
});
