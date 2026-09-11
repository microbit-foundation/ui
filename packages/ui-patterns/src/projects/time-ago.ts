/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape } from "react-intl";
import { uiPatternsMessage } from "../messages";

const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

/**
 * "3 days ago", in the intl locale. Sub-minute times say "a few seconds ago"
 * rather than counting, since the card does not re-render every second.
 */
export const formatTimeAgo = (
  intl: IntlShape,
  timestamp: number,
  now: number = Date.now(),
): string => {
  const diffInSeconds = (timestamp - now) / 1000;
  for (const { unit, seconds } of units) {
    const interval = Math.round(diffInSeconds / seconds);
    if (Math.abs(interval) >= 1) {
      if (unit === "second") {
        return intl.formatMessage(
          uiPatternsMessage("ui-patterns.timestamp-seconds"),
        );
      }
      return intl.formatRelativeTime(interval, unit);
    }
  }
  return intl.formatMessage(uiPatternsMessage("ui-patterns.timestamp-now"));
};
