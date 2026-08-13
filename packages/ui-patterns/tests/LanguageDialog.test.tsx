/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider, ToastProvider } from "@microbit/ui";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
        support: [
          { name: "Microsoft MakeCode", supported: true },
          { name: "My App", supported: false },
        ],
      },
    ],
  });
  // h3: the dialog title is the h2.
  expect(
    screen.getByRole("heading", { name: "Fully supported", level: 3 }),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Partially supported", level: 3 }),
  ).toBeTruthy();
  // The warning trigger gets a short name; the statement is its description.
  const warning = screen.getByRole("button", {
    name: "Language not fully supported",
  });
  expect(warning).toBeTruthy();
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

it("shows the preview footnote only when a preview language is listed", () => {
  const notice = /early preview of in-progress translations/;
  renderDialog();
  expect(screen.queryByText(notice)).toBeNull();
  cleanup();
  renderDialog({ languages: [{ id: "en" }, { id: "fr", preview: true }] });
  const noticeEl = screen.getByText(notice);
  // The asterisk is visible but stays out of the accessible name; the
  // footnote is linked as the preview card's description instead.
  expect(screen.getByText("*")).toBeTruthy();
  const button = screen.getByRole("button", { name: "Français French" });
  expect(button.getAttribute("aria-describedby")).toBe(noticeEl.id);
  expect(screen.getByTestId("en").getAttribute("aria-describedby")).toBeNull();
});

it("toasts the support statement when a partially supported language is chosen", async () => {
  renderDialog({
    languages: [
      { id: "en" },
      {
        id: "ar",
        support: [
          { name: "Microsoft MakeCode", supported: true },
          { name: "My App", supported: false },
        ],
      },
    ],
  });
  await userEvent.click(screen.getByTestId("ar"));
  const toast = await screen.findByRole("alert");
  expect(within(toast).getByText("Language not fully supported")).toBeTruthy();
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

it("an all-supported checklist means fully supported: no sections, no warning", () => {
  renderDialog({
    languages: [
      { id: "en", support: [{ name: "Microsoft MakeCode", supported: true }] },
      { id: "cy", support: [{ name: "Microsoft MakeCode", supported: true }] },
    ],
  });
  expect(screen.queryByRole("heading", { name: "Fully supported" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Language not fully supported" }),
  ).toBeNull();
});
