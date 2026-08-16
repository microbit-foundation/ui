/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Avatar, AvatarBadge, avatarInitials, token } from "../src";

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

// The exact hash is a compatibility contract: these are the colours apps'
// existing avatar rosters rely on, so a change here changes shipped UIs.
it.each([
  ["Ada Lovelace", "#8b409d"],
  ["Tim Berners-Lee", "#9e72e7"],
  ["", undefined],
])("derives the background colour from %s", (name, expected) => {
  const { container } = render(<Avatar name={name} data-testid="avatar" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.getPropertyValue("--avatar-bg") || undefined).toBe(
    expected,
  );
});

it("darkens the text over a light derived background", () => {
  // #9e72e7 is bright enough to need dark text; #8b409d is not. The colour
  // is a custom property, not a state selector, so a call site's `css` can
  // still override it.
  const { container: light } = render(<Avatar name="Tim Berners-Lee" />);
  expect(
    (light.firstElementChild as HTMLElement).style.getPropertyValue(
      "--avatar-color",
    ),
  ).toBe(token("colors.fg.default"));
  const { container: dark } = render(<Avatar name="Ada Lovelace" />);
  expect(
    (dark.firstElementChild as HTMLElement).style.getPropertyValue(
      "--avatar-color",
    ),
  ).toBe(token("colors.fg.onEmphasis"));
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

it("exports its initials helper under a name worth claiming globally", () => {
  expect(avatarInitials("Ada Lovelace")).toBe("AL");
  expect(avatarInitials("  Ada  ")).toBe("A");
});

// The photo is loaded out of band, so these drive that loader rather than a
// DOM <img>: jsdom fetches nothing, and the element only mounts once loaded.
const imageLoader = () => {
  const instances: {
    src?: string;
    onload?: () => void;
    onerror?: () => void;
  }[] = [];
  class FakeImage {
    onload?: () => void;
    onerror?: () => void;
    srcset?: string;
    #src?: string;
    constructor() {
      instances.push(this as never);
    }
    set src(value: string) {
      this.#src = value;
    }
    get src() {
      return this.#src!;
    }
  }
  const original = globalThis.Image;
  globalThis.Image = FakeImage as never;
  return {
    instances,
    restore: () => {
      globalThis.Image = original;
    },
  };
};

it("shows the initials until the photo loads, then the photo", async () => {
  const loader = imageLoader();
  try {
    render(<Avatar name="Ada Lovelace" src="ada.png" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" }).textContent).toBe(
      "AL",
    );
    expect(document.querySelector("img")).toBeNull();

    await act(async () => loader.instances[0].onload!());
    const img = document.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("ada.png");
    expect(img.getAttribute("alt")).toBe("Ada Lovelace");
  } finally {
    loader.restore();
  }
});

it("keeps the fallback when the photo fails, rather than a broken image", async () => {
  const loader = imageLoader();
  try {
    render(<Avatar name="Ada Lovelace" src="gone.png" />);
    await act(async () => loader.instances[0].onerror!());
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Ada Lovelace" }).textContent).toBe(
      "AL",
    );
  } finally {
    loader.restore();
  }
});

it("starts again when the src changes", async () => {
  const loader = imageLoader();
  try {
    const { rerender } = render(<Avatar name="Ada Lovelace" src="ada.png" />);
    await act(async () => loader.instances[0].onload!());
    expect(document.querySelector("img")!.getAttribute("src")).toBe("ada.png");

    // The next person's photo: the old one must not linger while it loads.
    rerender(<Avatar name="Grace Hopper" src="grace.png" />);
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Grace Hopper" }).textContent).toBe(
      "GH",
    );

    await act(async () => loader.instances[1].onload!());
    expect(document.querySelector("img")!.getAttribute("src")).toBe(
      "grace.png",
    );
  } finally {
    loader.restore();
  }
});

it("derives no background colour once the photo is showing", async () => {
  const loader = imageLoader();
  try {
    const { container } = render(<Avatar name="Ada Lovelace" src="ada.png" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--avatar-bg")).toBe("#8b409d");

    await act(async () => loader.instances[0].onload!());
    expect(root.style.getPropertyValue("--avatar-bg")).toBe("");
    expect(root.hasAttribute("data-loaded")).toBe(true);
  } finally {
    loader.restore();
  }
});
