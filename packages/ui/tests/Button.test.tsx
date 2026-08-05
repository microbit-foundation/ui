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

it("isLoading shows a spinner and disables the button", () => {
  render(
    <IntlProvider locale="en">
      <Button isLoading>Save</Button>
    </IntlProvider>,
  );
  const button = screen.getByRole("button");
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(button.getAttribute("data-loading")).toBe("");
  expect(screen.getByRole("status", { name: "Loading" })).not.toBeNull();
});

it("isLoading keeps the label in the layout so the button holds its size", () => {
  // Chakra's behaviour, which both consumers depend on (ml-trainer hand-rolled
  // it, data-microbit-org's dialogs had it from Chakra): the label is hidden
  // with opacity, not removed, so a row of buttons doesn't reflow mid-submit.
  render(
    <IntlProvider locale="en">
      <Button isLoading leftIcon={<span>icon</span>}>
        Save
      </Button>
    </IntlProvider>,
  );
  const button = screen.getByRole("button", { name: /Save/ });
  expect(button.textContent).toContain("Save");
  expect(button.textContent).toContain("icon");
});
