/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { ReactNode, RefObject, useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import { uiPatternsMessage } from "../messages";
import { ConfirmDialog } from "./ConfirmDialog";
import { NameProjectDialog } from "./NameProjectDialog";
import { ProjectNameDialogReason, ProjectSummary } from "./types";

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
  getSelectedIds?: () => string[];
}

export interface ProjectActions {
  /**
   * The name and confirm dialogs, wired up. Render once on the page. They
   * return focus to the card menu button that opened them.
   */
  dialogs: ReactNode;
  /** For ProjectCard, so a dialog can return focus to the menu button. */
  setFinalFocusRef: (ref: RefObject<HTMLElement>) => void;
  /** Opens the name dialog. Without an id, acts on the single selection. */
  renameOrDuplicate: (reason: ProjectNameDialogReason, id?: string) => void;
  /** Opens the confirm dialog. Without an id, acts on the selection. */
  requestDelete: (id?: string) => void;
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
  getSelectedIds,
}: UseProjectActionsOptions): ProjectActions => {
  const [target, setTarget] = useState<ProjectSummary | undefined>();
  const [nameReason, setNameReason] = useState<ProjectNameDialogReason>();
  const [confirming, setConfirming] = useState(false);
  const [finalFocusRef, setFinalFocusRef] = useState<
    RefObject<HTMLElement> | undefined
  >();
  const clearFinalFocusRef = useCallback(() => setFinalFocusRef(undefined), []);

  const resolve = useCallback(
    (id?: string): ProjectSummary | undefined => {
      const selected = getSelectedIds?.() ?? [];
      const resolvedId =
        id ?? (selected.length === 1 ? selected[0] : undefined);
      return projects.find((p) => p.id === resolvedId);
    },
    [getSelectedIds, projects],
  );

  const renameOrDuplicate = useCallback(
    (reason: ProjectNameDialogReason, id?: string) => {
      const project = resolve(id);
      if (project) {
        setTarget(project);
        setNameReason(reason);
      }
    },
    [resolve],
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

  const requestDelete = useCallback(
    (id?: string) => {
      const project = id ? resolve(id) : undefined;
      setTarget(project);
      if (project || (getSelectedIds?.().length ?? 0) > 0) {
        setConfirming(true);
      }
    },
    [getSelectedIds, resolve],
  );
  const closeConfirm = useCallback(() => setConfirming(false), []);
  const confirmDelete = useCallback(async () => {
    const ids = target ? [target.id] : getSelectedIds?.() ?? [];
    closeConfirm();
    if (ids.length > 0) {
      await onDelete(ids);
    }
  }, [closeConfirm, getSelectedIds, onDelete, target]);

  const selectedCount = getSelectedIds?.().length ?? 0;
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

  return { dialogs, setFinalFocusRef, renameOrDuplicate, requestDelete };
};
