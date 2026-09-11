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
import {
  ProjectCard,
  ProjectsToolbar,
  useProjectActions,
  useProjectSelection,
} from "../src";

afterEach(cleanup);

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>{children}</SharedUIProvider>
  </IntlProvider>
);

const project = { id: "p1", name: "Heart", timestamp: Date.now() - 120_000 };

describe("ProjectCard", () => {
  it("shows the name, content, description and age, and opens by name", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <ProjectCard
        project={project}
        description="main.py, helper.py"
        onOpen={onOpen}
        onDelete={() => {}}
        onRename={() => {}}
        onDuplicate={() => {}}
      >
        <span data-testid="glyph" />
      </ProjectCard>,
      { wrapper: Providers },
    );
    expect(screen.getByTestId("glyph")).toBeDefined();
    expect(screen.getByText("main.py, helper.py")).toBeDefined();
    const time = screen.getByText("2 minutes ago");
    expect(time.tagName).toBe("TIME");
    expect(time.getAttribute("dateTime")).toBe(
      new Date(project.timestamp).toISOString(),
    );
    expect(time.getAttribute("title")).toMatch(/\d/);
    await user.click(screen.getByRole("button", { name: "Heart" }));
    expect(onOpen).toHaveBeenCalledWith("p1");
  });

  it("offers open, rename, duplicate and delete from its menu, passing the menu button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onRename = vi.fn();
    const onDuplicate = vi.fn();
    const onDelete = vi.fn();
    render(
      <ProjectCard
        project={project}
        onOpen={onOpen}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />,
      { wrapper: Providers },
    );
    const menuButton = screen.getByRole("button", {
      name: "Heart actions menu",
    });
    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(onDuplicate).toHaveBeenCalledWith("p1", menuButton);

    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledWith("p1", menuButton);

    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("p1", menuButton);

    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Open" }));
    expect(onOpen).toHaveBeenCalledWith("p1");
  });

  it("shows a selection checkbox and skip link only when selectable", async () => {
    const user = userEvent.setup();
    const onSelected = vi.fn();
    const onSkipToToolbar = vi.fn();
    const { rerender } = render(
      <ProjectCard
        project={project}
        onOpen={() => {}}
        onDelete={() => {}}
        onRename={() => {}}
        onDuplicate={() => {}}
      />,
      { wrapper: Providers },
    );
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Skip to toolbar" }),
    ).toBeNull();

    rerender(
      <ProjectCard
        project={project}
        isSelected={false}
        onSelected={onSelected}
        onSkipToToolbar={onSkipToToolbar}
        onOpen={() => {}}
        onDelete={() => {}}
        onRename={() => {}}
        onDuplicate={() => {}}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Select Heart" }));
    expect(onSelected).toHaveBeenCalledWith("p1");
    await user.click(screen.getByRole("button", { name: "Skip to toolbar" }));
    expect(onSkipToToolbar).toHaveBeenCalledOnce();
  });
});

const projects = [
  { id: "a", name: "Alpha", timestamp: 1 },
  { id: "b", name: "Beta", timestamp: 2 },
];

const Harness = ({
  onRename,
  onDuplicate,
  onDelete,
}: {
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onDelete: (ids: string[]) => void;
}) => {
  const selection = useProjectSelection(projects);
  const actions = useProjectActions({
    projects,
    onRename,
    onDuplicate,
    onDelete,
    getSelectedIds: () => selection.selectedIds,
  });
  return (
    <>
      {actions.dialogs}
      {selection.hasSelection && (
        <ProjectsToolbar
          selectedCount={selection.selectedIds.length}
          onRename={actions.rename}
          onDuplicate={actions.duplicate}
          onDelete={actions.requestDelete}
          onClearSelection={selection.clear}
        />
      )}
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          isSelected={selection.isSelected(p.id)}
          onSelected={selection.toggle}
          onOpen={() => {}}
          onDelete={actions.requestDelete}
          onRename={actions.rename}
          onDuplicate={actions.duplicate}
        />
      ))}
    </>
  );
};

describe("useProjectActions", () => {
  it("renames from a card menu via the name dialog", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(
      <Harness onRename={onRename} onDuplicate={vi.fn()} onDelete={vi.fn()} />,
      {
        wrapper: Providers,
      },
    );
    await user.click(
      screen.getByRole("button", { name: "Alpha actions menu" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(
      dialog.getByRole("heading", { name: "Rename project" }),
    ).toBeDefined();
    const field = dialog.getByRole("textbox", { name: /Name/ });
    expect((field as HTMLInputElement).value).toEqual("Alpha");
    await user.clear(field);
    await user.type(field, "Alpha 2");
    await user.click(dialog.getByRole("button", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledWith("a", "Alpha 2");
  });

  it("deletes the selection from the toolbar after confirmation", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <Harness onRename={vi.fn()} onDuplicate={vi.fn()} onDelete={onDelete} />,
      {
        wrapper: Providers,
      },
    );
    await user.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    await user.click(screen.getByRole("checkbox", { name: "Select Beta" }));
    await user.click(screen.getByRole("button", { name: "Delete 2 projects" }));
    const alert = within(screen.getByRole("alertdialog"));
    expect(
      alert.getByText("Are you sure you want to delete 2 projects?"),
    ).toBeDefined();
    await user.click(alert.getByRole("button", { name: "Delete 2 projects" }));
    expect(onDelete).toHaveBeenCalledWith(["a", "b"]);
  });

  it("deletes one project from its menu, naming it in the confirmation", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <Harness onRename={vi.fn()} onDuplicate={vi.fn()} onDelete={onDelete} />,
      {
        wrapper: Providers,
      },
    );
    await user.click(screen.getByRole("button", { name: "Beta actions menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    const alert = within(screen.getByRole("alertdialog"));
    expect(alert.getByText(/delete the project "Beta"/)).toBeDefined();
    await user.click(alert.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(["b"]);
  });
});
