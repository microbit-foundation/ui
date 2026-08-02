/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Avatar, AvatarBadge, token } from "../src";

afterEach(cleanup);

it("shows the initials of the first and last words", () => {
  render(<Avatar name="Ada Lovelace" />);
  expect(screen.getByRole("img", { name: "Ada Lovelace" }).textContent).toBe(
    "AL",
  );
});

it("shows one initial for a single-word name", () => {
  render(<Avatar name="Ada" />);
  expect(screen.getByRole("img", { name: "Ada" }).textContent).toBe("A");
});

// The hash is Chakra's, and these are the colours Chakra produced for these
// names — the fidelity contract for apps migrating a roster of avatars.
it.each([
  ["Ada Lovelace", "#8b409d"],
  ["Tim Berners-Lee", "#9e72e7"],
  ["", undefined],
])("derives Chakra's background colour from %s", (name, expected) => {
  const { container } = render(<Avatar name={name} data-testid="avatar" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.getPropertyValue("--avatar-bg") || undefined).toBe(
    expected,
  );
});

it("darkens the text over a light derived background", () => {
  // #9e72e7 is bright enough to need dark text; #8b409d is not. The colour
  // is a custom property, not a state selector, so a call site's `css` still
  // beats it where cascade layers aren't in play (playbook gotcha #40).
  const { container: light } = render(<Avatar name="Tim Berners-Lee" />);
  expect(
    (light.firstElementChild as HTMLElement).style.getPropertyValue(
      "--avatar-color",
    ),
  ).toBe(token("colors.gray.800"));
  const { container: dark } = render(<Avatar name="Ada Lovelace" />);
  expect(
    (dark.firstElementChild as HTMLElement).style.getPropertyValue(
      "--avatar-color",
    ),
  ).toBe(token("colors.white"));
});

it("labels a supplied icon in place rather than wrapping it", () => {
  const { container } = render(
    <Avatar icon={<svg data-testid="icon" />} iconLabel="Everyone" />,
  );
  const icon = screen.getByTestId("icon");
  expect(icon.getAttribute("aria-label")).toBe("Everyone");
  expect(icon.parentElement).toBe(container.firstElementChild);
});

it("falls back to the generic glyph with no name and no icon", () => {
  render(<Avatar iconLabel="avatar" />);
  expect(screen.getByRole("img", { name: "avatar" }).tagName).toBe("svg");
});

it("gives the badge the placement it asks for", () => {
  render(
    <Avatar name="Ada Lovelace">
      <AvatarBadge data-testid="badge" placement="top-start" />
    </Avatar>,
  );
  expect(screen.getByTestId("badge").className).toContain(
    "placement_top-start",
  );
});
