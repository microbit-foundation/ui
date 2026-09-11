/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider } from "@microbit/ui";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary, NotFoundPage, UnexpectedErrorPage } from "../src";

afterEach(cleanup);
afterEach(() => {
  vi.restoreAllMocks();
});

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>{children}</SharedUIProvider>
  </IntlProvider>
);

const supportUrl = "https://support.example.org/";

describe("UnexpectedErrorPage", () => {
  it("explains, links to support and offers a reload", async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    render(
      <UnexpectedErrorPage supportUrl={supportUrl} onReload={onReload} />,
      {
        wrapper: Providers,
      },
    );
    expect(
      screen.getByRole("heading", { name: "An unexpected error occurred" }),
    ).toBeDefined();
    const link = screen.getByRole<HTMLAnchorElement>("link", {
      name: /raising a support request/,
    });
    expect(link.href).toBe(supportUrl);
    expect(link.target).toBe("_blank");
    expect(screen.queryByText(/Error reference/)).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Click to reload the page" }),
    );
    expect(onReload).toHaveBeenCalledOnce();
  });

  it("focuses the heading on mount", () => {
    render(<UnexpectedErrorPage supportUrl={supportUrl} />, {
      wrapper: Providers,
    });
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "An unexpected error occurred" }),
    );
  });

  it("shows the reference with a copy button when given", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<UnexpectedErrorPage supportUrl={supportUrl} reference="abc123" />, {
      wrapper: Providers,
    });
    expect(screen.getByText(/Error reference/).textContent).toBe(
      "Error reference: abc123",
    );
    const copy = screen.getByRole("button", { name: "Copy error reference" });
    await user.click(copy);
    expect(writeText).toHaveBeenCalledWith("abc123");
    expect(copy.getAttribute("aria-label")).toBe("Copied");
  });
});

describe("NotFoundPage", () => {
  it("links home with the default text", () => {
    render(<NotFoundPage homeUrl="/home" />, { wrapper: Providers });
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeDefined();
    const link = screen.getByRole<HTMLAnchorElement>("link", {
      name: "Go to home page",
    });
    expect(link.getAttribute("href")).toBe("/home");
  });

  it("takes app-specific link text", () => {
    render(<NotFoundPage homeUrl="/" homeLinkText="CreateAI home page" />, {
      wrapper: Providers,
    });
    expect(
      screen.getByRole("link", { name: "CreateAI home page" }),
    ).toBeDefined();
  });
});

const Thrower = (): ReactNode => {
  throw new Error("boom");
};

// React reports a caught render error to console.error and jsdom reports it
// again as a window error event; silence both for the throwing cases.
const expectRenderError = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const swallow = (e: ErrorEvent) => e.preventDefault();
  window.addEventListener("error", swallow);
  return () => window.removeEventListener("error", swallow);
};

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary fallback={() => <p>fallback</p>}>
        <p>content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("content")).toBeDefined();
  });

  it("reports the error and passes the returned reference to the fallback", () => {
    const restore = expectRenderError();
    const onError = vi.fn().mockReturnValue("ref-1");
    render(
      <ErrorBoundary
        onError={onError}
        fallback={(error, reference) => (
          <p>
            {(error as Error).message} {reference}
          </p>
        )}
      >
        <Thrower />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledOnce();
    expect((onError.mock.calls[0][0] as Error).message).toBe("boom");
    expect(screen.getByText("boom ref-1")).toBeDefined();
    restore();
  });

  it("renders the fallback without a reference when onError returns nothing", () => {
    const restore = expectRenderError();
    render(
      <ErrorBoundary
        fallback={(_error, reference) => (
          <p>fallback {reference ?? "no-reference"}</p>
        )}
      >
        <Thrower />
      </ErrorBoundary>,
    );
    expect(screen.getByText("fallback no-reference")).toBeDefined();
    restore();
  });
});
