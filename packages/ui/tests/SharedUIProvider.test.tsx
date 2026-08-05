/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { IntlProvider } from "react-intl";
import { NumberField, SharedUIProvider } from "../src";

// NumberField's steppers are labelled by react-aria from its own catalogs, so
// they show which locale react-aria resolved. Match the stepper's own word
// rather than the whole accessible name, which also carries the field label and
// composes in a different order per locale.
const renderNumberField = (locale: string, props = {}) =>
  render(
    <IntlProvider locale={locale}>
      <SharedUIProvider {...props}>
        <NumberField label="Count" />
      </SharedUIProvider>
    </IntlProvider>,
  );

afterEach(cleanup);

it("localizes react-aria's strings from the IntlProvider locale", () => {
  renderNumberField("fr");
  expect(screen.getByRole("button", { name: /Augmenter/ })).toBeTruthy();
});

it("resolves a locale react-aria lacks strings for to English", () => {
  renderNumberField("cy");
  expect(screen.getByRole("button", { name: /Increase/ })).toBeTruthy();
});

it("prefers an explicit locale over the IntlProvider's", () => {
  renderNumberField("fr", { locale: "de" });
  expect(screen.getByRole("button", { name: /erhöhen/ })).toBeTruthy();
});

// Only reachable via the prop: react-intl rejects a malformed locale itself.
it("survives a malformed explicit locale", () => {
  renderNumberField("en", { locale: "en_GB" });
  expect(screen.getByRole("button", { name: /Increase/ })).toBeTruthy();
});
