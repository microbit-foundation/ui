/**
 * List state shared by the projects pages: ranking a search, sorting, and
 * a multi-selection that forgets projects that disappear.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useMemo, useReducer } from "react";
import { ProjectSortField, ProjectSummary, SortDirection } from "./types";

/**
 * Ranks projects against a search query. Every term must match the name or
 * one of the app's secondary terms (file names, action names). Name matches
 * outrank secondary matches; exact beats prefix beats substring. Projects
 * with no match are dropped.
 */
export const rankProjects = <P extends ProjectSummary>(
  projects: P[],
  query: string,
  secondaryTerms: (project: P) => string[] = () => [],
): P[] => {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return projects;
  }
  const ranked: Array<{ project: P; score: number }> = [];
  for (const project of projects) {
    const name = project.name.toLowerCase();
    const secondary = secondaryTerms(project).map((t) => t.toLowerCase());
    const allMatch = terms.every(
      (term) => name.includes(term) || secondary.some((s) => s.includes(term)),
    );
    if (!allMatch) {
      continue;
    }
    let score = 0;
    for (const term of terms) {
      if (name === term) {
        score += 100;
      } else if (name.startsWith(term)) {
        score += 50;
      } else if (name.includes(term)) {
        score += 30;
      }
      for (const s of secondary) {
        if (s === term) {
          score += 15;
        } else if (s.startsWith(term)) {
          score += 8;
        } else if (s.includes(term)) {
          score += 5;
        }
      }
    }
    ranked.push({ project, score });
  }
  return ranked.sort((a, b) => b.score - a.score).map((r) => r.project);
};

export const sortProjects = <P extends ProjectSummary>(
  projects: P[],
  field: ProjectSortField,
  direction: SortDirection,
): P[] => {
  const sorted = [...projects].sort((a, b) =>
    field === "name"
      ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      : a.timestamp - b.timestamp,
  );
  return direction === "desc" ? sorted.reverse() : sorted;
};

/** The default direction when switching to a field: newest first, A to Z. */
export const defaultSortDirection = (field: ProjectSortField): SortDirection =>
  field === "name" ? "asc" : "desc";

export interface ProjectSelection {
  selectedIds: string[];
  hasSelection: boolean;
  /**
   * The selection as it was when last non-empty. For a toolbar that slides
   * out on clearing, so it does not change shape mid-animation.
   */
  lastSelectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

interface SelectionState {
  selected: string[];
  last: string[];
}

type SelectionAction = { type: "toggle"; id: string } | { type: "clear" };

const selectionReducer = (
  state: SelectionState,
  action: SelectionAction,
): SelectionState => {
  switch (action.type) {
    case "toggle": {
      const selected = state.selected.includes(action.id)
        ? state.selected.filter((v) => v !== action.id)
        : [...state.selected, action.id];
      return { selected, last: selected.length > 0 ? selected : state.last };
    }
    case "clear":
      return { selected: [], last: state.last };
  }
};

const noSelection: SelectionState = { selected: [], last: [] };

/**
 * Multi-selection of projects by id. A project that leaves the list (deleted,
 * perhaps in another tab) leaves the selection too.
 */
export const useProjectSelection = (
  projects: ProjectSummary[],
): ProjectSelection => {
  const [state, dispatch] = useReducer(selectionReducer, noSelection);
  const selectedIds = useMemo(() => {
    const ids = new Set(projects.map((p) => p.id));
    return state.selected.filter((id) => ids.has(id));
  }, [projects, state.selected]);
  const toggle = useCallback(
    (id: string) => dispatch({ type: "toggle", id }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );
  return useMemo(
    () => ({
      selectedIds,
      hasSelection: selectedIds.length > 0,
      lastSelectedIds: state.last,
      isSelected,
      toggle,
      clear,
    }),
    [selectedIds, state.last, isSelected, toggle, clear],
  );
};
