/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it } from "vitest";
import { TooltipButton } from "../src";

afterEach(cleanup);

// Presses go through fireEvent.click, not user-event: jsdom gives every element
// a 0x0 rect at the origin, and react-aria's usePress cancels a press it thinks
// ended outside the trigger (playbook gotcha #15). react-aria treats a bare
// click as a virtual press, which is also the path a screen reader takes.
//
// Not covered here, because jsdom has no layout: the pointer geometry that keeps
// the tooltip open while it is hovered, and its behaviour inside a modal, where
// react-aria marks the tooltip's container inert. Both need a real browser — see
// the TooltipButton stories.

const tooltip = () => screen.queryByRole("tooltip");
const trigger = (name = "About storage") =>
  screen.getByRole("button", { name });

const renderOne = (label = "Saved in this browser") =>
  render(
    <TooltipButton aria-label="About storage" label={label}>
      <span>i</span>
    </TooltipButton>,
  );

it("names the button and describes it with the body", () => {
  renderOne();
  const describedBy = trigger().getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  expect(document.getElementById(describedBy!)?.textContent).toEqual(
    "Saved in this browser",
  );
});

it("makes the body the accessible name without aria-label", () => {
  render(
    <TooltipButton label="Saved in this browser">
      <span>i</span>
    </TooltipButton>,
  );
  expect(
    screen.getByRole("button", { name: "Saved in this browser" }),
  ).toBeTruthy();
});

it("opens on keyboard focus", async () => {
  const user = userEvent.setup();
  renderOne();
  expect(tooltip()).toBeNull();
  await user.tab();
  expect(document.activeElement).toEqual(trigger());
  expect(tooltip()).not.toBeNull();
});

// The reason this component exists rather than a bare Tooltip: react-aria binds
// a tooltip's close to keydown as well as pointerdown, so any key dismissed it
// and only hover or focus brought it back.
it("stays open when a key other than Escape is pressed", async () => {
  const user = userEvent.setup();
  renderOne();
  await user.tab();
  expect(tooltip()).not.toBeNull();
  await user.keyboard("a");
  expect(tooltip()).not.toBeNull();
});

it("closes on Escape", async () => {
  const user = userEvent.setup();
  renderOne();
  await user.tab();
  await user.keyboard("{Escape}");
  expect(tooltip()).toBeNull();
});

it("toggles on press, so a dismissed tooltip can be brought back", () => {
  renderOne();
  fireEvent.click(trigger());
  expect(tooltip()).not.toBeNull();
  fireEvent.click(trigger());
  expect(tooltip()).toBeNull();
  fireEvent.click(trigger());
  expect(tooltip()).not.toBeNull();
});

it("keeps only one tooltip open across instances", () => {
  render(
    <>
      <TooltipButton aria-label="About one" label="One">
        <span>i</span>
      </TooltipButton>
      <TooltipButton aria-label="About two" label="Two">
        <span>i</span>
      </TooltipButton>
    </>,
  );
  fireEvent.click(trigger("About one"));
  expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  fireEvent.click(trigger("About two"));
  const open = screen.getAllByRole("tooltip");
  expect(open).toHaveLength(1);
  expect(open[0].textContent).toEqual("Two");
});
