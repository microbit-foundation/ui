/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SafeAreaNavInsets, SafeAreaNavSource, SharedUIProvider } from "../src";

afterEach(cleanup);

const navVars = () => ({
  left: document.documentElement.style.getPropertyValue("--safe-area-nav-left"),
  right: document.documentElement.style.getPropertyValue(
    "--safe-area-nav-right",
  ),
});

it("writes the source's insets to :root and removes them on unmount", () => {
  let pushInsets: ((insets: SafeAreaNavInsets) => void) | undefined;
  let unsubscribed = false;
  const source: SafeAreaNavSource = (onChange) => {
    pushInsets = onChange;
    onChange({ left: 30, right: 0 });
    return () => {
      unsubscribed = true;
    };
  };
  const { unmount } = render(
    <SharedUIProvider safeAreaNavSource={source}>
      <div>Body</div>
    </SharedUIProvider>,
  );
  expect(navVars()).toEqual({ left: "30px", right: "0px" });
  pushInsets!({ left: 0, right: 48 });
  expect(navVars()).toEqual({ left: "0px", right: "48px" });
  unmount();
  expect(unsubscribed).toBe(true);
  expect(navVars()).toEqual({ left: "", right: "" });
});

it("leaves the variables alone without a source", () => {
  document.documentElement.style.setProperty("--safe-area-nav-left", "48px");
  const { unmount } = render(
    <SharedUIProvider>
      <div>Body</div>
    </SharedUIProvider>,
  );
  expect(navVars().left).toBe("48px");
  unmount();
  // Another owner's value must survive the provider's unmount too.
  expect(navVars().left).toBe("48px");
  document.documentElement.style.removeProperty("--safe-area-nav-left");
});
