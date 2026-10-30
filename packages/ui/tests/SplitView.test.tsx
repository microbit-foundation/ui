/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  SplitView,
  SplitViewMode,
  SplitViewPane,
  SplitViewProps,
  SplitViewSplitter,
} from "../src";

// jsdom has no layout. A 1000px root with a 10px splitter at 300px;
// the primary pane's position is set per test, as the browser would lay it
// out from DOM order and text direction.
let primaryLeft = 0;
beforeEach(() => {
  primaryLeft = 0;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      // Square, so the same geometry serves either orientation.
      const rect = (start: number, size: number) =>
        ({ left: start, top: start, width: size, height: size }) as DOMRect;
      if (this.hasAttribute("data-splitter")) {
        return rect(300, 10);
      }
      if (this.hasAttribute("data-orientation")) {
        return rect(0, 1000);
      }
      if (this.hasAttribute("data-primary")) {
        return rect(primaryLeft, 300);
      }
      return rect(0, 0);
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderSplitView = ({
  primaryAtEnd = false,
  mode = "open",
  ...props
}: Partial<SplitViewProps> & {
  primaryAtEnd?: boolean;
  mode?: SplitViewMode;
} = {}) => {
  const primary = (
    <SplitViewPane primary data-testid="primary">
      Primary
    </SplitViewPane>
  );
  const secondary = <SplitViewPane>Secondary</SplitViewPane>;
  return render(
    <SplitView
      mode={mode}
      defaultSize={300}
      primaryMinSize={200}
      primaryMaxSize={600}
      secondaryMinSize={300}
      compactSize={64}
      {...props}
    >
      {primaryAtEnd ? secondary : primary}
      <SplitViewSplitter aria-label="Resize sidebar" />
      {primaryAtEnd ? primary : secondary}
    </SplitView>,
  );
};

const splitter = () => screen.getByRole("separator");
const primaryWidth = () => screen.getByTestId("primary").style.width;

it("exposes a window splitter controlling the primary pane", () => {
  renderSplitView();
  const sep = splitter();
  expect(sep).toHaveProperty("tabIndex", 0);
  expect(sep.getAttribute("aria-label")).toBe("Resize sidebar");
  expect(sep.getAttribute("aria-orientation")).toBe("vertical");
  expect(sep.getAttribute("aria-controls")).toBe(
    screen.getByTestId("primary").id,
  );
  // 300px in a 200–600px range.
  expect(sep.getAttribute("aria-valuenow")).toBe("25");
  expect(sep.getAttribute("aria-valuetext")).toBe("25%");
  expect(sep.getAttribute("aria-valuemin")).toBe("0");
  expect(sep.getAttribute("aria-valuemax")).toBe("100");
});

it("resizes with the arrow keys along the split axis only", () => {
  renderSplitView();
  fireEvent.keyDown(splitter(), { key: "ArrowRight" });
  expect(primaryWidth()).toBe("310px");
  fireEvent.keyDown(splitter(), { key: "ArrowLeft" });
  fireEvent.keyDown(splitter(), { key: "ArrowLeft" });
  expect(primaryWidth()).toBe("290px");
  fireEvent.keyDown(splitter(), { key: "ArrowUp" });
  expect(primaryWidth()).toBe("290px");
});

it("moves the splitter, not the pane edge, when the primary pane follows it", () => {
  primaryLeft = 310;
  renderSplitView({ primaryAtEnd: true });
  fireEvent.keyDown(splitter(), { key: "ArrowRight" });
  expect(primaryWidth()).toBe("290px");
});

it("jumps to the minimum and maximum with Home and End", () => {
  renderSplitView();
  fireEvent.keyDown(splitter(), { key: "End" });
  expect(primaryWidth()).toBe("600px");
  expect(splitter().getAttribute("aria-valuenow")).toBe("100");
  fireEvent.keyDown(splitter(), { key: "Home" });
  expect(primaryWidth()).toBe("200px");
});

it("caps the primary pane to leave the secondary its minimum", () => {
  renderSplitView({ primaryMaxSize: Infinity, defaultSize: 900 });
  // 1000px less the 10px splitter less the secondary's 300px.
  expect(primaryWidth()).toBe("690px");
  fireEvent.keyDown(splitter(), { key: "End" });
  expect(primaryWidth()).toBe("690px");
});

it("reports the final size once per interaction", () => {
  const onSizeChangeEnd = vi.fn();
  renderSplitView({ onSizeChangeEnd });
  fireEvent.keyDown(splitter(), { key: "ArrowRight" });
  fireEvent.keyDown(splitter(), { key: "ArrowRight" });
  expect(onSizeChangeEnd.mock.calls).toEqual([[310], [320]]);
});

it("follows a controlled size", () => {
  const onSizeChange = vi.fn();
  const { rerender } = render(
    <SplitView size={250} onSizeChange={onSizeChange} primaryMinSize={200}>
      <SplitViewPane primary data-testid="primary" />
      <SplitViewSplitter aria-label="Resize" />
      <SplitViewPane />
    </SplitView>,
  );
  fireEvent.keyDown(splitter(), { key: "ArrowRight" });
  expect(onSizeChange).toHaveBeenCalledWith(260);
  expect(primaryWidth()).toBe("250px");
  rerender(
    <SplitView size={260} onSizeChange={onSizeChange} primaryMinSize={200}>
      <SplitViewPane primary data-testid="primary" />
      <SplitViewSplitter aria-label="Resize" />
      <SplitViewPane />
    </SplitView>,
  );
  expect(primaryWidth()).toBe("260px");
});

it("drops the splitter when compact or collapsed", () => {
  const { unmount } = renderSplitView({ mode: "compact" });
  expect(screen.queryByRole("separator")).toBeNull();
  expect(primaryWidth()).toBe("64px");
  unmount();
  renderSplitView({ mode: "collapsed" });
  expect(screen.queryByRole("separator")).toBeNull();
  expect(primaryWidth()).toBe("0px");
  expect(screen.getByTestId("primary").hasAttribute("data-collapsed")).toBe(
    true,
  );
});

it("sizes the primary pane by height for a horizontal splitter", () => {
  render(
    <SplitView orientation="horizontal" defaultSize={150}>
      <SplitViewPane />
      <SplitViewSplitter aria-label="Resize" />
      <SplitViewPane primary data-testid="primary" />
    </SplitView>,
  );
  expect(splitter().getAttribute("aria-orientation")).toBe("horizontal");
  expect(screen.getByTestId("primary").style.height).toBe("150px");
});

// jsdom's PointerEvent doesn't take pageX from its init dict.
const pointer = (
  type: "pointerDown" | "pointerMove" | "pointerUp",
  target: Element | Window,
  pageX: number,
) => {
  const event = createEvent[type](target, {
    pointerId: 1,
    pointerType: "mouse",
    button: 0,
  });
  Object.defineProperty(event, "pageX", { value: pageX });
  Object.defineProperty(event, "pageY", { value: 0 });
  fireEvent(target, event);
};

it("resizes by pointer drag, marking the root as dragging", () => {
  const onSizeChangeEnd = vi.fn();
  const { container } = renderSplitView({ onSizeChangeEnd });
  const root = container.firstElementChild as HTMLElement;
  pointer("pointerDown", splitter(), 305);
  pointer("pointerMove", window, 345);
  expect(primaryWidth()).toBe("340px");
  expect(root.hasAttribute("data-dragging")).toBe(true);
  // Past the maximum and back: the splitter stays under the pointer.
  pointer("pointerMove", window, 1000);
  expect(primaryWidth()).toBe("600px");
  pointer("pointerMove", window, 405);
  expect(primaryWidth()).toBe("400px");
  pointer("pointerUp", window, 405);
  expect(root.hasAttribute("data-dragging")).toBe(false);
  expect(onSizeChangeEnd.mock.calls).toEqual([[400]]);
});
