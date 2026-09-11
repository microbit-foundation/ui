/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * What the project components need to know about a project. Apps keep their
 * own richer records and pass these, or a superset.
 */
export interface ProjectSummary {
  id: string;
  name: string;
  /** Last modified or opened, in milliseconds since the epoch. */
  timestamp: number;
}

export type ProjectNameDialogReason = "rename" | "duplicate";

export type ProjectSortField = "name" | "timestamp";

export type SortDirection = "asc" | "desc";
