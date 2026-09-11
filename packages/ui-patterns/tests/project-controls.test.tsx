/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider } from "@microbit/ui";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectsToolbar, SearchInput, SortInput } from "../src";

afterEach(cleanup);

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>{children}</SharedUIProvider>
  </IntlProvider>
);

describe("SearchInput", () => {
  it("reports typing and clears back to the box", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<SearchInput value="" onChange={onChange} />, {
      wrapper: Providers,
    });
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    await user.type(screen.getByRole("textbox", { name: "Search" }), "h");
    expect(onChange).toHaveBeenLastCalledWith("h");

    rerender(<SearchInput value="heart" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Search" }),
    );
  });
});

describe("SortInput", () => {
  it("offers name and last modified with a direction toggle", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const onToggleDirection = vi.fn();
    render(
      <SortInput
        field="timestamp"
        direction="desc"
        onFieldChange={onFieldChange}
        onToggleDirection={onToggleDirection}
        hasSearchQuery={false}
      />,
      { wrapper: Providers },
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort projects" }),
      "name",
    );
    expect(onFieldChange).toHaveBeenCalledWith("name");
    await user.click(screen.getByRole("button", { name: "Descending order" }));
    expect(onToggleDirection).toHaveBeenCalledOnce();
  });

  it("shows relevance and disables itself while searching", () => {
    render(
      <SortInput
        field="name"
        direction="asc"
        onFieldChange={() => {}}
        onToggleDirection={() => {}}
        hasSearchQuery
      />,
      { wrapper: Providers },
    );
    const select = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Sort projects",
    });
    expect(select.disabled).toBe(true);
    expect(select.value).toEqual("relevance");
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Descending order",
      }).disabled,
    ).toBe(true);
  });
});

describe("ProjectsToolbar", () => {
  it("offers rename and duplicate only for a single selection", () => {
    const { rerender } = render(
      <ProjectsToolbar
        selectedCount={1}
        onRenameDuplicate={() => {}}
        onDelete={() => {}}
        onClearSelection={() => {}}
      />,
      { wrapper: Providers },
    );
    const group = screen.getByRole("group", { name: "Selection actions" });
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Rename",
      "Duplicate",
      "Delete",
      "Clear",
    ]);
    expect(group).toBeDefined();

    rerender(
      <ProjectsToolbar
        selectedCount={3}
        onRenameDuplicate={() => {}}
        onDelete={() => {}}
        onClearSelection={() => {}}
      />,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Delete 3 projects",
      "Clear",
    ]);
  });

  it("calls back with the reason and keeps accessible names when icon-only", async () => {
    const user = userEvent.setup();
    const onRenameDuplicate = vi.fn();
    const onDelete = vi.fn();
    const onClearSelection = vi.fn();
    render(
      <ProjectsToolbar
        selectedCount={1}
        iconOnly
        onRenameDuplicate={onRenameDuplicate}
        onDelete={onDelete}
        onClearSelection={onClearSelection}
      />,
      { wrapper: Providers },
    );
    await user.click(screen.getByRole("button", { name: "Duplicate" }));
    expect(onRenameDuplicate).toHaveBeenCalledWith("duplicate");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClearSelection).toHaveBeenCalledOnce();
  });
});
