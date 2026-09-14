/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ConfirmDialog, Text } from "@microbit/ui";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { uiPatternsMessage } from "../messages";
import { NameProjectDialog } from "./NameProjectDialog";
import { ProjectSummary } from "./types";

type NameDialogReason = "rename" | "duplicate";

// A stable default so the callbacks below do not re-create every render.
const noSelection: string[] = [];

export interface UseProjectActionsOptions {
  projects: ProjectSummary[];
  onRename: (id: string, name: string) => void | Promise<void>;
  onDuplicate: (id: string, name: string) => void | Promise<void>;
  /** One id from a card's menu, or the selection from the toolbar. */
  onDelete: (ids: string[]) => void | Promise<void>;
  /**
   * The current selection, for toolbar actions that name no project. Rename
   * and duplicate act only when exactly one project is selected.
   */
  selectedIds?: string[];
}

/**
 * Each action takes the id of the project, or acts on the selection without
 * one, and optionally the element that started it, which the dialog returns
 * focus to on closing. ProjectCard passes its menu button.
 */
type ProjectAction = (id?: string, trigger?: HTMLElement) => void;

export interface ProjectActions {
  /**
   * The name and confirm dialogs, wired up. Render once on the page.
   */
  dialogs: ReactNode;
  /** Opens the name dialog. Needs exactly one project. */
  rename: ProjectAction;
  /** Opens the name dialog for the copy. Needs exactly one project. */
  duplicate: ProjectAction;
  /** Opens the confirm dialog for one project or the selection. */
  delete: ProjectAction;
}

/**
 * The rename, duplicate and delete flows behind ProjectCard menus and the
 * ProjectsToolbar: which project is being acted on, the dialogs, and focus
 * return. The app supplies what each action does and logs what it wants.
 */
export const useProjectActions = ({
  projects,
  onRename,
  onDuplicate,
  onDelete,
  selectedIds = noSelection,
}: UseProjectActionsOptions): ProjectActions => {
  const [target, setTarget] = useState<ProjectSummary | undefined>();
  const [nameReason, setNameReason] = useState<NameDialogReason>();
  const [confirming, setConfirming] = useState(false);
  const [trigger, setTrigger] = useState<HTMLElement | undefined>();
  const finalFocusRef = useMemo(
    () => ({ current: trigger ?? null }),
    [trigger],
  );
  const clearFinalFocusRef = useCallback(() => setTrigger(undefined), []);

  const resolve = useCallback(
    (id?: string): ProjectSummary | undefined => {
      const resolvedId =
        id ?? (selectedIds.length === 1 ? selectedIds[0] : undefined);
      return projects.find((p) => p.id === resolvedId);
    },
    [selectedIds, projects],
  );

  const openNameDialog = useCallback(
    (reason: NameDialogReason, id?: string, trigger?: HTMLElement) => {
      const project = resolve(id);
      if (project) {
        setTarget(project);
        setTrigger(trigger);
        setNameReason(reason);
      }
    },
    [resolve],
  );
  const rename = useCallback<ProjectAction>(
    (id, trigger) => openNameDialog("rename", id, trigger),
    [openNameDialog],
  );
  const duplicate = useCallback<ProjectAction>(
    (id, trigger) => openNameDialog("duplicate", id, trigger),
    [openNameDialog],
  );
  const closeNameDialog = useCallback(() => setNameReason(undefined), []);
  const saveName = useCallback(
    async (name: string) => {
      const project = target;
      const reason = nameReason;
      closeNameDialog();
      if (project && reason) {
        await (reason === "rename"
          ? onRename(project.id, name)
          : onDuplicate(project.id, name));
      }
    },
    [closeNameDialog, nameReason, onDuplicate, onRename, target],
  );

  const requestDelete = useCallback<ProjectAction>(
    (id, trigger) => {
      const project = resolve(id);
      setTarget(project);
      setTrigger(trigger);
      if (project || selectedIds.length > 0) {
        setConfirming(true);
      }
    },
    [resolve, selectedIds],
  );
  const closeConfirm = useCallback(() => setConfirming(false), []);
  const confirmDelete = useCallback(async () => {
    const ids = target ? [target.id] : selectedIds;
    closeConfirm();
    if (ids.length > 0) {
      await onDelete(ids);
    }
  }, [closeConfirm, onDelete, selectedIds, target]);

  const selectedCount = selectedIds.length;
  const dialogs = (
    <>
      <NameProjectDialog
        isOpen={nameReason !== undefined}
        initialName={target?.name ?? ""}
        onClose={closeNameDialog}
        onCloseComplete={clearFinalFocusRef}
        onSave={saveName}
        finalFocusRef={finalFocusRef}
        heading={
          <FormattedMessage
            {...uiPatternsMessage(
              nameReason === "duplicate"
                ? "ui-patterns.duplicate-project-heading"
                : "ui-patterns.rename-project-heading",
            )}
          />
        }
        confirmText={
          <FormattedMessage
            {...uiPatternsMessage(
              nameReason === "duplicate"
                ? "ui-patterns.duplicate-project-action"
                : "ui-patterns.rename-project-action",
            )}
          />
        }
      />
      <ConfirmDialog
        isOpen={confirming}
        heading={
          <FormattedMessage
            {...uiPatternsMessage(
              target
                ? "ui-patterns.delete-project-confirm-heading"
                : "ui-patterns.delete-projects-confirm-heading",
            )}
          />
        }
        body={
          <Text>
            {target ? (
              <FormattedMessage
                {...uiPatternsMessage(
                  "ui-patterns.delete-project-confirm-text",
                )}
                values={{ project: target.name }}
              />
            ) : (
              <FormattedMessage
                {...uiPatternsMessage(
                  "ui-patterns.delete-projects-confirm-text",
                )}
                values={{ numProjects: selectedCount }}
              />
            )}
          </Text>
        }
        confirmText={
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.delete-project-action")}
            values={{ count: target ? 1 : selectedCount }}
          />
        }
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
        onCloseComplete={clearFinalFocusRef}
        finalFocusRef={finalFocusRef}
      />
    </>
  );

  return { dialogs, rename, duplicate, delete: requestDelete };
};
