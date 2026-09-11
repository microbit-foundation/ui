/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider } from "@microbit/ui";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog, NameProjectDialog } from "../src";

afterEach(cleanup);

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>{children}</SharedUIProvider>
  </IntlProvider>
);

const dialog = () => within(screen.getByRole("dialog"));

describe("NameProjectDialog", () => {
  it("starts with the initial name and saves the trimmed name", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <NameProjectDialog
        isOpen
        initialName="Old name"
        onClose={() => {}}
        onSave={onSave}
        confirmText="Save"
      />,
      { wrapper: Providers },
    );
    expect(
      dialog().getByRole("heading", { name: "Name your project" }),
    ).toBeDefined();
    const field = dialog().getByRole("textbox", { name: /Name/ });
    expect((field as HTMLInputElement).value).toEqual("Old name");
    await user.clear(field);
    await user.type(field, "  New name  ");
    await user.click(dialog().getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith("New name");
  });

  it("submits on Enter", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <NameProjectDialog
        isOpen
        initialName="Project"
        onClose={() => {}}
        onSave={onSave}
        confirmText="Save"
      />,
      { wrapper: Providers },
    );
    await user.type(dialog().getByRole("textbox", { name: /Name/ }), "{Enter}");
    expect(onSave).toHaveBeenCalledWith("Project");
  });

  it("refuses a blank name", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <NameProjectDialog
        isOpen
        initialName="Project"
        onClose={() => {}}
        onSave={onSave}
        confirmText="Save"
      />,
      { wrapper: Providers },
    );
    const field = dialog().getByRole("textbox", { name: /Name/ });
    await user.clear(field);
    await user.type(field, "   ");
    expect(
      dialog().getByRole<HTMLButtonElement>("button", { name: "Save" })
        .disabled,
    ).toBe(true);
    await user.type(field, "{Enter}");
    expect(onSave).not.toHaveBeenCalled();
    expect(
      dialog().getByText("The project name cannot be empty"),
    ).toBeDefined();
  });

  it("takes a heading, confirm text and helper text", () => {
    render(
      <NameProjectDialog
        isOpen
        initialName=""
        onClose={() => {}}
        onSave={() => {}}
        heading="Rename project"
        confirmText="Rename"
        helperText="Used when you save."
      />,
      { wrapper: Providers },
    );
    expect(
      dialog().getByRole("heading", { name: "Rename project" }),
    ).toBeDefined();
    expect(dialog().getByRole("button", { name: "Rename" })).toBeDefined();
    expect(dialog().getByText("Used when you save.")).toBeDefined();
  });
});

describe("ConfirmDialog", () => {
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
});
