/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it } from "vitest";
import { SharedUIProvider, Slider } from "../src";

afterEach(cleanup);

const renderSlider = (locale: string) =>
  render(
    <IntlProvider locale={locale}>
      <SharedUIProvider setDocumentLang={false}>
        <Slider
          aria-label="Threshold"
          value={30}
          onChange={() => undefined}
          mark={<span>mark</span>}
        />
      </SharedUIProvider>
    </IntlProvider>,
  );

const markOffset = () =>
  (screen.getByText("mark").parentElement as HTMLElement).style.left;

// react-aria mirrors the thumb's physical `left` itself rather than going
// logical, so anything positioned along the track has to mirror to match it.
it("positions the mark from the left in an LTR locale", () => {
  renderSlider("en");
  expect(markOffset()).toBe("30%");
});

it("mirrors the mark's offset in an RTL locale", () => {
  renderSlider("ar");
  expect(markOffset()).toBe("70%");
});
