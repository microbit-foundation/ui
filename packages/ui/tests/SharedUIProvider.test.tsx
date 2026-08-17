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

const resetDocument = () => {
  document.documentElement.lang = "en";
  document.documentElement.dir = "";
};

it("keeps <html lang> in step with the locale", () => {
  resetDocument();
  renderModal("fr");
  expect(document.documentElement.lang).toBe("fr");
  cleanup();
  renderModal("fr", { locale: "de" });
  expect(document.documentElement.lang).toBe("de");
});

it("keeps <html dir> in step with the locale", () => {
  resetDocument();
  renderModal("ar");
  expect(document.documentElement.dir).toBe("rtl");
  cleanup();
  renderModal("fr");
  expect(document.documentElement.dir).toBe("ltr");
});

// racLocale's "en-GB" fallback also keeps isRTL, which throws on a bad tag,
// off the malformed value.
it("falls back to ltr for a malformed locale", () => {
  resetDocument();
  renderModal("en", { locale: "en_GB" });
  expect(document.documentElement.dir).toBe("ltr");
});

it("leaves <html lang> and <html dir> alone when setDocumentLang is false", () => {
  resetDocument();
  renderModal("ar", { setDocumentLang: false });
  expect(document.documentElement.lang).toBe("en");
  expect(document.documentElement.dir).toBe("");
});

it("leaves <html lang> and <html dir> alone with no IntlProvider and no locale prop", () => {
  resetDocument();
  render(
    <SharedUIProvider>
      <div>Body</div>
    </SharedUIProvider>,
  );
  expect(document.documentElement.lang).toBe("en");
  expect(document.documentElement.dir).toBe("");
});
