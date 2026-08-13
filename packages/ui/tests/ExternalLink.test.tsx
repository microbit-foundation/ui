/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it } from "vitest";
import { ExternalLink } from "../src";

afterEach(cleanup);

it("announces the new tab in the accessible name", () => {
  render(
    <IntlProvider locale="en">
      <ExternalLink href="https://example.com">Help translate</ExternalLink>
    </IntlProvider>,
  );
  const link = screen.getByRole("link", {
    name: "Help translate, opens in a new tab",
  });
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toBe("noopener");
});
