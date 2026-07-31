/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import { ToastFn, ToastProvider, useToast } from "../src";

// useToast writes to a module-level queue; capture the trigger from a
// component so tests drive toasts the way apps do.
let toast: ToastFn;
const Capture = () => {
  toast = useToast();
  return null;
};

const renderProvider = () =>
  // English renders from defaultMessage; no catalog needed.
  render(
    <IntlProvider locale="en">
      <Capture />
      <ToastProvider />
    </IntlProvider>,
  );

afterEach(() => {
  // The queue outlives each test's render; empty it, then unmount
  // (no vitest globals, so testing-library can't auto-cleanup).
  act(() => toast.closeAll());
  cleanup();
  vi.useRealTimers();
});

it("auto-dismisses after 5s by default", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ title: "Saved", status: "success" }));
  expect(screen.getByText("Saved")).toBeDefined();
  act(() => vi.advanceTimersByTime(4900));
  expect(screen.getByText("Saved")).toBeDefined();
  act(() => vi.advanceTimersByTime(200));
  expect(screen.queryByText("Saved")).toBeNull();
});

it("honours an explicit duration", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ title: "Quick", duration: 2000 }));
  act(() => vi.advanceTimersByTime(2100));
  expect(screen.queryByText("Quick")).toBeNull();
});

it("persistent toasts never time out and force the close button on", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() =>
    toast({ title: "Storage full", status: "error", persistent: true }),
  );
  act(() => vi.advanceTimersByTime(60_000));
  expect(screen.getByText("Storage full")).toBeDefined();
  expect(screen.getByRole("button", { name: "Close" })).toBeDefined();
});

it("close button dismisses a persistent toast", async () => {
  renderProvider();
  act(() =>
    toast({ title: "Storage full", status: "error", persistent: true }),
  );
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByText("Storage full")).toBeNull();
});

it("re-adding a visible id is a no-op", () => {
  renderProvider();
  act(() => toast({ id: "dup", title: "First" }));
  act(() => toast({ id: "dup", title: "Second" }));
  expect(screen.getByText("First")).toBeDefined();
  expect(screen.queryByText("Second")).toBeNull();
});

it("update replaces a visible toast's content", () => {
  renderProvider();
  act(() => toast({ id: "u", title: "Before" }));
  act(() => toast.update("u", { title: "After" }));
  expect(screen.queryByText("Before")).toBeNull();
  expect(screen.getByText("After")).toBeDefined();
});
