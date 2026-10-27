/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import en from "../lang/ui.en.json";
import { MakeCodeJavaScriptCodeView, PythonEditorCodeView } from "../src";

// The English an app compiles from this package's catalog.
const english = Object.fromEntries(
  Object.entries(en).map(([id, { defaultMessage }]) => [id, defaultMessage]),
);

// jsdom does no layout, so scrollWidth and clientWidth are both 0 and it has
// no ResizeObserver. Each test sets the widths the code element reports, and
// can call resize() to have the views recheck them.
const setWidths = (scrollWidth: number, clientWidth: number) => {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(
    scrollWidth,
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
    clientWidth,
  );
};

let resizeCallbacks: (() => void)[] = [];
const resize = () =>
  act(() => resizeCallbacks.forEach((callback) => callback()));

beforeEach(() => {
  resizeCallbacks = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
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

it("numbers each line, not counting a trailing newline", () => {
  setWidths(100, 100);
  const { container } = render(
    <IntlProvider locale="en" messages={english}>
      <PythonEditorCodeView code={"a\n\nb\n"} />
      <PythonEditorCodeView code="" />
    </IntlProvider>,
  );
  const gutters = container.querySelectorAll(".mb-code-view__gutter");
  expect(gutters[0].textContent).toBe("1\n2\n3");
  expect(gutters[1].textContent).toBe("1");
});

it("stays out of the tab order when the code fits", () => {
  setWidths(100, 100);
  const { container } = render(
    <IntlProvider locale="en" messages={english}>
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
    <IntlProvider locale="en" messages={english}>
      <PythonEditorCodeView code="x = 1" />
      <MakeCodeJavaScriptCodeView code="let x = 1" />
    </IntlProvider>,
  );
  expect(
    screen.getByRole("group", { name: "Python code" }).getAttribute("tabindex"),
  ).toBe("0");
  expect(screen.getByRole("group", { name: "JavaScript code" })).toBeDefined();
});

it("stays focusable while focused after it stops scrolling", () => {
  setWidths(500, 100);
  render(
    <IntlProvider locale="en" messages={english}>
      <PythonEditorCodeView code="x = 1" />
    </IntlProvider>,
  );
  const code = screen.getByRole("group", { name: "Python code" });
  act(() => code.focus());
  setWidths(100, 100);
  resize();
  expect(document.activeElement).toBe(code);
  expect(code.getAttribute("tabindex")).toBe("0");
  act(() => code.blur());
  expect(code.hasAttribute("tabindex")).toBe(false);
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
