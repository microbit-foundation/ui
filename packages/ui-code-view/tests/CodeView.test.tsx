/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MakeCodeJavaScriptCodeView, PythonEditorCodeView } from "../src";

// jsdom does no layout, so scrollWidth and clientWidth are both 0 and it has
// no ResizeObserver. Each test sets the widths the code element reports.
const setWidths = (scrollWidth: number, clientWidth: number) => {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(
    scrollWidth,
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
    clientWidth,
  );
};

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("stays out of the tab order when the code fits", () => {
  setWidths(100, 100);
  const { container } = render(
    <IntlProvider locale="en">
      <PythonEditorCodeView code="x = 1" />
    </IntlProvider>,
  );
  const code = container.querySelector(".mb-code-view__code")!;
  expect(code.hasAttribute("tabindex")).toBe(false);
  expect(code.hasAttribute("role")).toBe(false);
});

it("is a focusable, named group when the code scrolls", () => {
  setWidths(500, 100);
  render(
    <IntlProvider locale="en">
      <PythonEditorCodeView code="x = 1" />
      <MakeCodeJavaScriptCodeView code="let x = 1" />
    </IntlProvider>,
  );
  expect(
    screen.getByRole("group", { name: "Python code" }).getAttribute("tabindex"),
  ).toBe("0");
  expect(screen.getByRole("group", { name: "JavaScript code" })).toBeDefined();
});

it("takes the name from the app's catalog", () => {
  setWidths(500, 100);
  render(
    <IntlProvider
      locale="fr"
      messages={{ "ui-code-view.python-label": "Code Python" }}
    >
      <PythonEditorCodeView code="x = 1" />
    </IntlProvider>,
  );
  expect(screen.getByRole("group", { name: "Code Python" })).toBeDefined();
});
