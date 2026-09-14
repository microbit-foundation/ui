/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "../src";

const intl = createIntl({ locale: "en" });
const now = 1_700_000_000_000;

describe("formatTimeAgo", () => {
  it("says now within the same second", () => {
    expect(formatTimeAgo(intl, now, now)).toEqual("now");
  });

  it("does not count seconds", () => {
    expect(formatTimeAgo(intl, now - 20_000, now)).toEqual("a few seconds ago");
  });

  it("uses the largest whole unit", () => {
    expect(formatTimeAgo(intl, now - 3 * 60_000, now)).toEqual("3 minutes ago");
    expect(formatTimeAgo(intl, now - 2 * 3_600_000, now)).toEqual(
      "2 hours ago",
    );
    expect(formatTimeAgo(intl, now - 5 * 86_400_000, now)).toEqual(
      "5 days ago",
    );
    expect(formatTimeAgo(intl, now - 2 * 2_592_000_000, now)).toEqual(
      "2 months ago",
    );
  });
});
