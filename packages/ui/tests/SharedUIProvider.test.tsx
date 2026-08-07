/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { IntlProvider } from "react-intl";
import { Modal, SharedUIProvider } from "../src";

// The probe is react-aria's hidden dismiss button, labelled from its own
// bundled catalogs, so it shows which locale react-aria resolved. (It used to
// be NumberField's steppers, but those labels are our react-intl messages now
// — README "Strings".)
const renderModal = (locale: string, props = {}) =>
  render(
    <IntlProvider locale={locale}>
      <SharedUIProvider {...props}>
        <Modal isOpen onClose={() => undefined}>
          Body
        </Modal>
      </SharedUIProvider>
    </IntlProvider>,
  );

afterEach(cleanup);

it("localizes react-aria's strings from the IntlProvider locale", () => {
  renderModal("fr");
  expect(screen.getAllByRole("button", { name: "Rejeter" })).not.toHaveLength(
    0,
  );
});

it("resolves a locale react-aria lacks strings for to English", () => {
  renderModal("cy");
  expect(screen.getAllByRole("button", { name: "Dismiss" })).not.toHaveLength(
    0,
  );
});

it("prefers an explicit locale over the IntlProvider's", () => {
  renderModal("fr", { locale: "de" });
  expect(screen.getAllByRole("button", { name: "Schließen" })).not.toHaveLength(
    0,
  );
});

// Only reachable via the prop: react-intl rejects a malformed locale itself.
it("survives a malformed explicit locale", () => {
  renderModal("en", { locale: "en_GB" });
  expect(screen.getAllByRole("button", { name: "Dismiss" })).not.toHaveLength(
    0,
  );
});
