/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Skeleton, SkeletonText, useDisclosure } from "../src";

afterEach(cleanup);

it("draws a line per noOfLines, the last one short", () => {
  const { container } = render(<SkeletonText noOfLines={5} spacing="1rem" />);
  const lines = [...container.firstElementChild!.children] as HTMLElement[];
  expect(lines).toHaveLength(5);
  expect(lines.map((l) => l.style.width)).toEqual([
    "100%",
    "100%",
    "100%",
    "100%",
    "80%",
  ]);
  // The gap goes between the lines, not after the last.
  expect(lines.map((l) => l.style.marginBottom)).toEqual([
    "1rem",
    "1rem",
    "1rem",
    "1rem",
    "0px",
  ]);
});

it("a single line is full width", () => {
  const { container } = render(<SkeletonText noOfLines={1} />);
  const line = container.firstElementChild!.firstElementChild as HTMLElement;
  expect(line.style.width).toBe("100%");
});

it("shows its children once loaded, without the placeholder styling", () => {
  const { container, rerender } = render(
    <Skeleton>
      <span>Ready</span>
    </Skeleton>,
  );
  expect((container.firstElementChild as HTMLElement).className).toContain(
    "skeleton",
  );

  rerender(
    <Skeleton isLoaded>
      <span>Ready</span>
    </Skeleton>,
  );
  expect((container.firstElementChild as HTMLElement).className).toBe("");
  expect(screen.getByText("Ready")).toBeTruthy();
});

it("useDisclosure opens, closes and toggles", () => {
  const { result } = renderHook(() => useDisclosure());
  expect(result.current.isOpen).toBe(false);
  act(() => result.current.onOpen());
  expect(result.current.isOpen).toBe(true);
  act(() => result.current.onToggle());
  expect(result.current.isOpen).toBe(false);
  act(() => result.current.onToggle());
  act(() => result.current.onClose());
  expect(result.current.isOpen).toBe(false);
});
