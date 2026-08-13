/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider, ToastProvider } from "@microbit/ui";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import { LanguageDialog, LanguageDialogProps } from "../src";

afterEach(cleanup);

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>
      {children}
      <ToastProvider />
    </SharedUIProvider>
  </IntlProvider>
);

const renderDialog = (props: Partial<LanguageDialogProps> = {}) =>
  render(
    <Providers>
      <LanguageDialog
        isOpen
        onClose={() => undefined}
        languages={[{ id: "en" }, { id: "cy" }]}
        onSelectLanguage={() => undefined}
        {...props}
      />
    </Providers>,
  );

it("renders a flat grid with no section headings when all languages are fully supported", () => {
  renderDialog();
  expect(screen.queryByRole("heading", { name: "Fully supported" })).toBeNull();
  expect(
    screen.queryByRole("heading", { name: "Partially supported" }),
  ).toBeNull();
  expect(screen.getByTestId("cy")).toBeTruthy();
});

it("splits into sections when a language is partially supported", () => {
  renderDialog({
    languages: [
      { id: "en" },
      {
        id: "ar",
        fullySupported: false,
        support: [{ name: "Microsoft MakeCode", supported: true }],
      },
    ],
  });
  expect(
    screen.getByRole("heading", { name: "Fully supported" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Partially supported" }),
  ).toBeTruthy();
});

it("selects on press: onSelectLanguage completes, then the dialog closes", async () => {
  const events: string[] = [];
  const onSelectLanguage = vi.fn(async (id: string) => {
    events.push(`select:${id}`);
  });
  const onClose = vi.fn(() => events.push("close"));
  renderDialog({ onSelectLanguage, onClose });
  await userEvent.click(screen.getByTestId("cy"));
  await waitFor(() => expect(onClose).toHaveBeenCalled());
  expect(events).toEqual(["select:cy", "close"]);
});

it("names cards from the registry via lang-tagged elements", () => {
  renderDialog();
  const button = screen.getByTestId("cy");
  const labelIds = button.getAttribute("aria-labelledby")?.split(" ") ?? [];
  expect(labelIds).toHaveLength(2);
  const [nameEl, enNameEl] = labelIds.map(
    (id) => document.getElementById(id) as HTMLElement,
  );
  expect(nameEl.textContent).toBe("Cymraeg");
  expect(nameEl.getAttribute("lang")).toBe("cy");
  expect(nameEl.getAttribute("dir")).toBe("auto");
  expect(enNameEl.textContent).toBe("Welsh");
  expect(enNameEl.getAttribute("lang")).toBe("en");
});

it("view-model name overrides beat the registry", () => {
  renderDialog({
    languages: [{ id: "en", name: "English (UK)", enName: "English (UK)" }],
  });
  const button = screen.getByTestId("en");
  const labelIds = button.getAttribute("aria-labelledby")?.split(" ") ?? [];
  expect(document.getElementById(labelIds[0])?.textContent).toBe(
    "English (UK)",
  );
});

it("marks the current language", () => {
  renderDialog({ currentLanguageId: "cy" });
  expect(screen.getByTestId("cy").getAttribute("aria-current")).toBe("true");
  expect(screen.getByTestId("en").getAttribute("aria-current")).toBeNull();
});

it("shows the preview footnote only when a preview language is listed", () => {
  const notice = /early preview of in-progress translations/;
  renderDialog();
  expect(screen.queryByText(notice)).toBeNull();
  cleanup();
  renderDialog({ languages: [{ id: "en" }, { id: "fr", preview: true }] });
  expect(screen.getByText(notice)).toBeTruthy();
  expect(screen.getByText("French*")).toBeTruthy();
});

it("toasts the support statement when a partially supported language is chosen", async () => {
  renderDialog({
    languages: [
      { id: "en" },
      {
        id: "ar",
        fullySupported: false,
        support: [
          { name: "Microsoft MakeCode", supported: true },
          { name: "My App", supported: false },
        ],
      },
    ],
  });
  await userEvent.click(screen.getByTestId("ar"));
  const toast = await screen.findByRole("alert");
  expect(
    within(toast).getByText("Language not fully supported"),
  ).toBeTruthy();
  expect(within(toast).getByText("Microsoft MakeCode")).toBeTruthy();
  expect(within(toast).getByLabelText("Unsupported")).toBeTruthy();
});

it("shows the help-translate link only when a href is given", () => {
  renderDialog();
  expect(screen.queryByRole("link", { name: /Help translate/ })).toBeNull();
  cleanup();
  renderDialog({ translationLinkHref: "https://example.com/translate" });
  const link = screen.getByRole("link", { name: /Help translate/ });
  expect(link.getAttribute("href")).toBe("https://example.com/translate");
  expect(link.getAttribute("rel")).toBe("noopener");
});

it("sorts languages into registry order regardless of input order", () => {
  renderDialog({ languages: [{ id: "cy" }, { id: "fr" }, { id: "en" }] });
  const ids = screen
    .getAllByTestId(/^(en|cy|fr)$/)
    .map((el) => el.getAttribute("data-testid"));
  expect(ids).toEqual(["en", "fr", "cy"]);
});
