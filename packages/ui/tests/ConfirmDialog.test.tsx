/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import { ConfirmDialog, SharedUIProvider } from "../src";

afterEach(cleanup);

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>{children}</SharedUIProvider>
  </IntlProvider>
);

it("is an alert dialog with cancel focused and a default cancel label", async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      isOpen
      heading="Delete it?"
      body="This cannot be undone."
      confirmText="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
    { wrapper: Providers },
  );
  const alert = within(screen.getByRole("alertdialog"));
  expect(alert.getByRole("heading", { name: "Delete it?" })).toBeDefined();
  const cancel = alert.getByRole("button", { name: "Cancel" });
  expect(document.activeElement).toBe(cancel);
  await user.click(alert.getByRole("button", { name: "Delete" }));
  expect(onConfirm).toHaveBeenCalledOnce();
  await user.click(cancel);
  expect(onCancel).toHaveBeenCalledOnce();
});
