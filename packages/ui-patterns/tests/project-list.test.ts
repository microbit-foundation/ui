/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  defaultSortDirection,
  rankProjects,
  sortProjects,
  useProjectSelection,
} from "../src";

interface P {
  id: string;
  name: string;
  timestamp: number;
  files: string[];
}
const p = (
  id: string,
  name: string,
  timestamp: number,
  files: string[] = [],
) => ({
  id,
  name,
  timestamp,
  files,
});
const files = (project: P) => project.files;

describe("rankProjects", () => {
  const projects = [
    p("a", "Heart", 1, ["main.py"]),
    p("b", "Heartbeat monitor", 2, ["main.py", "sensor.py"]),
    p("c", "Sensor log", 3, ["heart.py"]),
    p("d", "Radio", 4),
  ];

  it("returns the projects unchanged for an empty query", () => {
    expect(rankProjects(projects, "  ")).toBe(projects);
  });

  it("requires every term to match the name or a secondary term", () => {
    expect(
      rankProjects(projects, "heart sensor", files).map((x) => x.id),
    ).toEqual(["b", "c"]);
  });

  it("ranks exact, prefix then substring name matches above secondary matches", () => {
    expect(rankProjects(projects, "heart", files).map((x) => x.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("drops projects with no match and ignores case", () => {
    expect(rankProjects(projects, "RADIO", files).map((x) => x.id)).toEqual([
      "d",
    ]);
  });
});

describe("sortProjects", () => {
  const projects = [
    p("a", "banana", 2),
    p("b", "Apple", 3),
    p("c", "cherry", 1),
  ];

  it("sorts by name ignoring case", () => {
    expect(sortProjects(projects, "name", "asc").map((x) => x.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(sortProjects(projects, "name", "desc").map((x) => x.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("sorts by timestamp", () => {
    expect(
      sortProjects(projects, "timestamp", "desc").map((x) => x.id),
    ).toEqual(["b", "a", "c"]);
  });

  it("does not mutate the input", () => {
    const copy = [...projects];
    sortProjects(projects, "name", "asc");
    expect(projects).toEqual(copy);
  });

  it("defaults to newest first and A to Z", () => {
    expect(defaultSortDirection("timestamp")).toEqual("desc");
    expect(defaultSortDirection("name")).toEqual("asc");
  });
});

describe("useProjectSelection", () => {
  it("toggles, clears and remembers the last non-empty selection", () => {
    const projects = [p("a", "A", 1), p("b", "B", 2)];
    const { result } = renderHook(() => useProjectSelection(projects));
    expect(result.current.hasSelection).toBe(false);

    act(() => result.current.toggle("a"));
    act(() => result.current.toggle("b"));
    expect(result.current.selectedIds).toEqual(["a", "b"]);
    expect(result.current.isSelected("a")).toBe(true);

    act(() => result.current.toggle("a"));
    expect(result.current.selectedIds).toEqual(["b"]);

    act(() => result.current.clear());
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.lastSelectedIds).toEqual(["b"]);
  });

  it("drops a selected project that leaves the list", () => {
    let projects = [p("a", "A", 1), p("b", "B", 2)];
    const { result, rerender } = renderHook(() =>
      useProjectSelection(projects),
    );
    act(() => result.current.toggle("a"));
    act(() => result.current.toggle("b"));
    projects = [p("b", "B", 2)];
    rerender();
    expect(result.current.selectedIds).toEqual(["b"]);
  });
});
