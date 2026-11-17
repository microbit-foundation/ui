/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider } from "@microbit/ui";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import { YoutubeVideoEmbed } from "../src";

afterEach(cleanup);
afterEach(() => {
  vi.restoreAllMocks();
  // jsdom has no maxTouchPoints of its own, so mockIOS defines one.
  Reflect.deleteProperty(window.navigator, "maxTouchPoints");
});

const mockIOS = () => {
  vi.spyOn(window.navigator, "platform", "get").mockReturnValue("iPhone");
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: 5,
    configurable: true,
  });
};

const Providers = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <SharedUIProvider>{children}</SharedUIProvider>
  </IntlProvider>
);

const renderEmbed = () =>
  render(
    <YoutubeVideoEmbed
      youtubeId="QD8kpuSC0Vc"
      title="welcome video"
      alt="video introducing micro:bit classroom"
    />,
    { wrapper: Providers },
  );

it("shows a play button over the preview image, no iframe", () => {
  renderEmbed();
  expect(
    screen.getByRole("button", { name: "Play video: welcome video" }),
  ).toBeDefined();
  const img = screen.getByAltText<HTMLImageElement>(
    "video introducing micro:bit classroom",
  );
  expect(img.src).toBe("https://i.ytimg.com/vi/QD8kpuSC0Vc/maxresdefault.jpg");
  expect(document.querySelector("iframe")).toBeNull();
});

it("falls back to the always-available thumbnail when maxres is missing", () => {
  renderEmbed();
  fireEvent.error(screen.getByAltText("video introducing micro:bit classroom"));
  const img = screen.getByAltText<HTMLImageElement>(
    "video introducing micro:bit classroom",
  );
  expect(img.src).toBe("https://i.ytimg.com/vi/QD8kpuSC0Vc/hqdefault.jpg");
});

// YouTube answers a missing maxres with a 404 whose body is a 120×90
// placeholder image, so browsers fire load, not error.
it("falls back when maxres loads as YouTube's placeholder", () => {
  renderEmbed();
  const img = screen.getByAltText<HTMLImageElement>(
    "video introducing micro:bit classroom",
  );
  Object.defineProperty(img, "naturalWidth", { value: 120 });
  fireEvent.load(img);
  expect(img.src).toBe("https://i.ytimg.com/vi/QD8kpuSC0Vc/hqdefault.jpg");
});

it("keeps a maxres thumbnail that loaded", () => {
  renderEmbed();
  const img = screen.getByAltText<HTMLImageElement>(
    "video introducing micro:bit classroom",
  );
  Object.defineProperty(img, "naturalWidth", { value: 1280 });
  fireEvent.load(img);
  expect(img.src).toBe("https://i.ytimg.com/vi/QD8kpuSC0Vc/maxresdefault.jpg");
});

it("swaps in an autoplaying nocookie player on activation", async () => {
  const user = userEvent.setup();
  renderEmbed();
  await user.click(
    screen.getByRole("button", { name: "Play video: welcome video" }),
  );
  const iframe = screen.getByTitle<HTMLIFrameElement>("welcome video");
  expect(iframe.src).toBe(
    "https://www.youtube-nocookie.com/embed/QD8kpuSC0Vc?rel=0&cc_load_policy=1&autoplay=1",
  );
  expect(screen.queryByRole("button")).toBeNull();
});

// On iOS the facade would cost a second tap — WebKit won't autoplay a
// cross-origin iframe created after the tap — so the player renders
// upfront, lazily loaded and without autoplay, and the tap lands on
// YouTube's play button.
it("renders the player upfront on iOS, lazily, without autoplay", () => {
  mockIOS();
  renderEmbed();
  const iframe = screen.getByTitle<HTMLIFrameElement>("welcome video");
  expect(iframe.src).toBe(
    "https://www.youtube-nocookie.com/embed/QD8kpuSC0Vc?rel=0&cc_load_policy=1",
  );
  expect(iframe.getAttribute("loading")).toBe("lazy");
  expect(screen.queryByRole("button")).toBeNull();
});

// A server can't know the platform, so it renders the facade; on iOS,
// hydration has to match that before swapping in the player.
it("hydrates server-rendered HTML on iOS without a mismatch", () => {
  const embed = (
    <Providers>
      <YoutubeVideoEmbed youtubeId="QD8kpuSC0Vc" title="welcome video" />
    </Providers>
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(embed);
  document.body.append(container);
  expect(container.querySelector("button")).not.toBeNull();

  mockIOS();
  const recoverableErrors: unknown[] = [];
  let root: Root | undefined;
  act(() => {
    root = hydrateRoot(container, embed, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
  });
  expect(recoverableErrors).toEqual([]);
  expect(container.querySelector("iframe")?.getAttribute("loading")).toBe(
    "lazy",
  );
  act(() => root?.unmount());
  container.remove();
});
