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
  // eslint-disable-next-line react-hooks/globals -- see comment above.
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
  act(() => {
    vi.advanceTimersByTime(4900);
  });
  expect(screen.getByText("Saved")).toBeDefined();
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(screen.queryByText("Saved")).toBeNull();
});

it("names the status icon, inside the region that gets announced", () => {
  renderProvider();
  act(() => toast({ title: "Saved", status: "success" }));
  // Colour and glyph are the only visible status signals, so the status has
  // to reach assistive tech as text (react-spectrum's RSP-562). It has to sit
  // within the alert region react-aria announces, or it is never read out.
  const icon = screen.getByRole("img", { name: "Success" });
  const alert = screen.getByRole("alert");
  expect(alert.contains(icon)).toBe(true);
  expect(alert.getAttribute("aria-atomic")).toBe("true");
});

it("tags the close button as being on a dark surface", () => {
  renderProvider();
  act(() => toast({ title: "Saved", isClosable: true }));
  // The card is dark at every status, and no app can tag a surface the
  // package ships. Not the card itself: it is focusable too, and its own
  // ring is drawn outside it, on the page.
  expect(
    screen.getByRole("button", { name: "Close" }).getAttribute("data-surface"),
  ).toBe("dark");
  expect(
    screen.getByRole("alertdialog").getAttribute("data-surface"),
  ).toBeNull();
});

it("honours an explicit duration", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ title: "Quick", duration: 2000 }));
  act(() => {
    vi.advanceTimersByTime(2100);
  });
  expect(screen.queryByText("Quick")).toBeNull();
});

it("persistent toasts never time out and force the close button on", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() =>
    toast({ title: "Storage full", status: "error", persistent: true }),
  );
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
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

it("closeAll clears toasts queued behind the visible limit", () => {
  renderProvider();
  // More than maxVisibleToasts, so some are queued rather than rendered.
  for (let i = 0; i < 8; i++) {
    act(() => toast({ title: `Toast ${i}`, persistent: true }));
  }
  act(() => toast.closeAll());
  expect(screen.queryAllByRole("alertdialog")).toHaveLength(0);
});

it("update replaces a visible toast's content", () => {
  renderProvider();
  act(() => toast({ id: "u", title: "Before" }));
  act(() => toast.update("u", { title: "After" }));
  expect(screen.queryByText("Before")).toBeNull();
  expect(screen.getByText("After")).toBeDefined();
});

// The queue shows the newest maxVisibleToasts, so enough new toasts push an
// older one out of sight without closing it. Ids have to see it there.
const pushOutOfSight = () => {
  for (let i = 0; i < 5; i++) {
    act(() => toast({ title: `Filler ${i}` }));
  }
};
const expireFillers = () =>
  act(() => {
    vi.advanceTimersByTime(5100);
  });

it("re-adding an id that's queued out of sight is a no-op", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ id: "dup", title: "First", persistent: true }));
  pushOutOfSight();
  expect(screen.queryByText("First")).toBeNull();
  act(() => toast({ id: "dup", title: "Second", persistent: true }));
  expireFillers();
  expect(screen.getByText("First")).toBeDefined();
  expect(screen.queryByText("Second")).toBeNull();
});

it("update replaces a toast queued out of sight", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ id: "u", title: "Before", persistent: true }));
  pushOutOfSight();
  act(() => toast.update("u", { title: "After", persistent: true }));
  expireFillers();
  expect(screen.queryByText("Before")).toBeNull();
  expect(screen.getByText("After")).toBeDefined();
});

it("isActive tracks a toast queued out of sight", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ id: "a", title: "Hidden", persistent: true }));
  pushOutOfSight();
  expect(toast.isActive("a")).toBe(true);
});

it("an id is free again once its toast has gone", async () => {
  renderProvider();
  act(() => toast({ id: "r", title: "First", persistent: true }));
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(toast.isActive("r")).toBe(false);
  act(() => toast({ id: "r", title: "Second" }));
  expect(screen.getByText("Second")).toBeDefined();
});

it("an id is free again after it times out", () => {
  vi.useFakeTimers();
  renderProvider();
  act(() => toast({ id: "r", title: "First" }));
  act(() => {
    vi.advanceTimersByTime(5100);
  });
  act(() => toast({ id: "r", title: "Second" }));
  expect(screen.getByText("Second")).toBeDefined();
});

it("an id is free again after closeAll", () => {
  renderProvider();
  act(() => toast({ id: "r", title: "First", persistent: true }));
  act(() => toast.closeAll());
  act(() => toast({ id: "r", title: "Second" }));
  expect(screen.getByText("Second")).toBeDefined();
});
