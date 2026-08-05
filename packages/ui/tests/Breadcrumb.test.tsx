/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it } from "vitest";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../src";

afterEach(cleanup);

const trail = (
  <IntlProvider locale="en">
    <Breadcrumb separator=">">
      <BreadcrumbItem>
        <BreadcrumbLink href="/activities">Activities</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <BreadcrumbLink>This activity</BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  </IntlProvider>
);

it("renders a labelled nav with a list of items", () => {
  render(trail);
  const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(nav.querySelector("ol")).not.toBeNull();
  expect(nav.querySelectorAll("li")).toHaveLength(2);
});

it("renders earlier items as links and the current page as text", () => {
  render(trail);
  const link = screen.getByRole("link", { name: "Activities" });
  expect(link.getAttribute("href")).toBe("/activities");
  // The current page is not a link, has no href even if one is passed, and
  // carries aria-current.
  expect(screen.queryByRole("link", { name: "This activity" })).toBeNull();
  const current = screen.getByText("This activity");
  expect(current.tagName).toBe("SPAN");
  expect(current.getAttribute("aria-current")).toBe("page");
});

it("marks every separator presentational (the last is hidden by CSS)", () => {
  const { container } = render(trail);
  const separators = container.querySelectorAll("[data-separator]");
  // One per item; the recipe hides the last item's with display none, which
  // jsdom cannot assert (no Panda CSS here) — covered by the story instead.
  expect(separators).toHaveLength(2);
  separators.forEach((s) => expect(s.getAttribute("aria-hidden")).toBe("true"));
});
