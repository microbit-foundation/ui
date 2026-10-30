/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  mergeProps,
  useFocusRing,
  useId,
  useLocale,
  useMove,
} from "react-aria";
import { RiMore2Fill } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import { splitView } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

/**
 * - `open`: the primary pane is resizable and the separator is shown.
 * - `compact`: the primary pane is fixed at `compactSize`, with no separator
 *   (e.g. a sidebar reduced to an icon rail).
 * - `collapsed`: the primary pane is hidden (kept mounted, but out of the
 *   tab order and accessibility tree), with no separator.
 */
export type SplitViewMode = "open" | "compact" | "collapsed";

export type SplitViewOrientation = "horizontal" | "vertical";

const keyboardStep = 10;

interface SplitViewContextValue {
  orientation: SplitViewOrientation;
  mode: SplitViewMode;
  compactSize: number;
  primaryId: string;
  primaryRef: RefObject<HTMLDivElement>;
  primarySize: number;
  minSize: number;
  maxSize: number;
  setSize: (size: number) => void;
  commitSize: () => void;
  setDragging: (dragging: boolean) => void;
}

const SplitViewContext = createContext<SplitViewContextValue | null>(null);

const useSplitViewContext = (component: string): SplitViewContextValue => {
  const value = useContext(SplitViewContext);
  if (!value) {
    throw new Error(`${component} must be inside a SplitView`);
  }
  return value;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface SplitViewProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The splitter's orientation, as for `aria-orientation`: `vertical` sits
   * between side-by-side panes and moves left and right; `horizontal` sits
   * between stacked panes and moves up and down.
   */
  orientation?: SplitViewOrientation;
  mode?: SplitViewMode;
  /** The primary pane's size in `compact` mode, in px. */
  compactSize?: number;
  /** The primary pane's size in px, controlled. */
  size?: number;
  /** The primary pane's initial size in px, uncontrolled. */
  defaultSize?: number;
  /** Called as the size changes during a drag or key press. */
  onSizeChange?: (size: number) => void;
  /**
   * Called once a drag or key press finishes, with the final size. The place
   * to persist it.
   */
  onSizeChangeEnd?: (size: number) => void;
  /** The primary pane's minimum size in px. */
  minSize?: number;
  /** The primary pane's maximum size in px. */
  maxSize?: number;
  /**
   * The secondary pane's minimum size in px. When the container is too small
   * for both minimums, the primary pane keeps its minimum and the secondary
   * gives way.
   */
  secondaryMinSize?: number;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  /**
   * Two `SplitViewPane`s, one marked `primary`, with a `SplitViewSeparator`
   * between them. Either pane may be the primary.
   */
  children: ReactNode;
}

/**
 * SplitView — two panes with a separator that resizes one of them: the
 * primary pane has an explicit size, and the secondary takes the rest. A
 * WAI-ARIA window splitter: the separator is focusable, resizes with the
 * arrow keys (Home/End for the primary pane's minimum/maximum), and exposes
 * its position to assistive tech as a percentage of the available range.
 *
 * Sizes are px. The requested size is kept when the container shrinks below
 * it and restored when it grows back, so a window resize doesn't lose the
 * user's layout. Persisting the size is the app's call: control it with
 * `size`/`onSizeChangeEnd`.
 *
 * Collapsing the primary pane is app state (`mode`), driven by the app's own
 * controls, which also serve as the non-drag alternative WCAG 2.5.7 asks for.
 */
export const SplitView = ({
  orientation = "vertical",
  mode = "open",
  compactSize = 0,
  size,
  defaultSize,
  onSizeChange,
  onSizeChangeEnd,
  minSize = 0,
  maxSize = Infinity,
  secondaryMinSize = 0,
  css: cssProp,
  className,
  children,
  ...rest
}: SplitViewProps) => {
  const slots = splitView();
  const rootRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const primaryId = useId();
  const [uncontrolledSize, setUncontrolledSize] = useState(
    defaultSize ?? minSize,
  );
  const requestedSize = size ?? uncontrolledSize;
  // Container size less the separator. Undefined until measured, and while
  // the container has no size (e.g. inside a hidden tab), so the primary
  // pane isn't clamped to nothing.
  const [available, setAvailable] = useState<number>();
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const measure = () => {
      const sideBySide = orientation === "vertical";
      const rootRect = root.getBoundingClientRect();
      const total = sideBySide ? rootRect.width : rootRect.height;
      const separator = root.querySelector(":scope > [data-split-separator]");
      const separatorRect = separator?.getBoundingClientRect();
      const separatorSize = separatorRect
        ? sideBySide
          ? separatorRect.width
          : separatorRect.height
        : 0;
      setAvailable(total > 0 ? total - separatorSize : undefined);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
    // `mode` because the separator only renders when open.
  }, [orientation, mode]);

  const max =
    available === undefined
      ? Math.max(minSize, maxSize)
      : Math.max(minSize, Math.min(maxSize, available - secondaryMinSize));
  const primarySize = clamp(requestedSize, minSize, max);

  const latestSize = useRef(primarySize);
  const callbacks = useRef({ onSizeChange, onSizeChangeEnd });
  useLayoutEffect(() => {
    latestSize.current = primarySize;
    callbacks.current = { onSizeChange, onSizeChangeEnd };
  });
  const isControlled = size !== undefined;

  const setSize = useCallback(
    (next: number) => {
      if (next === latestSize.current) {
        return;
      }
      latestSize.current = next;
      if (!isControlled) {
        setUncontrolledSize(next);
      }
      callbacks.current.onSizeChange?.(next);
    },
    [isControlled],
  );
  const commitSize = useCallback(() => {
    callbacks.current.onSizeChangeEnd?.(latestSize.current);
  }, []);

  const context = useMemo<SplitViewContextValue>(
    () => ({
      orientation,
      mode,
      compactSize,
      primaryId,
      primaryRef,
      primarySize,
      minSize,
      maxSize: max,
      setSize,
      commitSize,
      setDragging,
    }),
    [
      orientation,
      mode,
      compactSize,
      primaryId,
      primarySize,
      minSize,
      max,
      setSize,
      commitSize,
    ],
  );

  return (
    <SplitViewContext.Provider value={context}>
      <div
        ref={rootRef}
        data-orientation={orientation}
        data-dragging={dragging || undefined}
        className={cx(
          slots.root,
          cssProp ? css(cssProp) : undefined,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </SplitViewContext.Provider>
  );
};

export interface SplitViewPaneProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The pane the separator sizes; exactly one pane is primary. It takes the
   * SplitView's generated id, which the separator's `aria-controls` names.
   */
  primary?: boolean;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  children?: ReactNode;
}

export const SplitViewPane = ({
  primary = false,
  css: cssProp,
  className,
  style,
  children,
  ...rest
}: SplitViewPaneProps) => {
  const slots = splitView();
  const { orientation, mode, compactSize, primaryId, primaryRef, primarySize } =
    useSplitViewContext("SplitViewPane");
  let sizeStyle: CSSProperties | undefined;
  if (primary) {
    const extent =
      mode === "open" ? primarySize : mode === "compact" ? compactSize : 0;
    sizeStyle =
      orientation === "vertical" ? { width: extent } : { height: extent };
  }
  return (
    <div
      {...rest}
      ref={primary ? primaryRef : undefined}
      id={primary ? primaryId : rest.id}
      data-primary={primary || undefined}
      data-collapsed={(primary && mode === "collapsed") || undefined}
      className={cx(slots.pane, cssProp ? css(cssProp) : undefined, className)}
      style={sizeStyle ? { ...style, ...sizeStyle } : style}
    >
      {children}
    </div>
  );
};

type SeparatorLabelling =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type SplitViewSeparatorProps = SeparatorLabelling & {
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  /** Replaces the default grip icon. */
  children?: ReactNode;
};

/**
 * The separator between the panes. Renders only in `open` mode. Needs an
 * accessible name: label it by what it resizes ("Resize sidebar"), or point
 * `aria-labelledby` at the primary pane's visible heading.
 */
export const SplitViewSeparator = ({
  css: cssProp,
  className,
  children,
  ...labelling
}: SplitViewSeparatorProps) => {
  const slots = splitView();
  const {
    orientation,
    mode,
    primaryId,
    primaryRef,
    primarySize,
    minSize,
    maxSize,
    setSize,
    commitSize,
    setDragging,
  } = useSplitViewContext("SplitViewSeparator");
  const { locale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  // +1 when moving the separator right/down grows the primary pane.
  const growth = useRef(1);
  const sideBySide = orientation === "vertical";
  const { isFocusVisible, focusProps } = useFocusRing();

  const { moveProps } = useMove({
    onMoveStart(e) {
      position.current = primarySize;
      // Measured rather than derived from DOM order and text direction:
      // the layout already accounts for both.
      const primary = primaryRef.current?.getBoundingClientRect();
      const separator = ref.current?.getBoundingClientRect();
      if (primary && separator) {
        const centre = (r: DOMRect) =>
          sideBySide ? r.left + r.width / 2 : r.top + r.height / 2;
        growth.current = centre(primary) < centre(separator) ? 1 : -1;
      }
      if (e.pointerType !== "keyboard") {
        setDragging(true);
      }
    },
    onMove(e) {
      let delta = sideBySide ? e.deltaX : e.deltaY;
      if (e.pointerType === "keyboard") {
        // Arrows across the split axis do nothing (APG window splitter).
        delta *= keyboardStep;
      }
      if (delta === 0) {
        return;
      }
      // Track the unclamped pointer position so that dragging past a limit
      // and back doesn't shift the separator relative to the pointer.
      position.current += delta * growth.current;
      setSize(clamp(position.current, minSize, maxSize));
    },
    onMoveEnd() {
      setDragging(false);
      commitSize();
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Home") {
      e.preventDefault();
      setSize(minSize);
      commitSize();
    } else if (e.key === "End" && Number.isFinite(maxSize)) {
      e.preventDefault();
      setSize(maxSize);
      commitSize();
    }
  };

  if (mode !== "open") {
    return null;
  }
  const range = maxSize - minSize;
  const percent =
    Number.isFinite(range) && range > 0
      ? Math.round(((primarySize - minSize) / range) * 100)
      : 0;
  // Known gap: TalkBack doesn't send swipe adjustments to a separator. A
  // visually hidden range input fixes that (react-aria's column resizer
  // does it), at the cost of desktop screen readers announcing a slider.
  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-orientation={orientation}
      aria-controls={primaryId}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={new Intl.NumberFormat(locale, {
        style: "percent",
      }).format(percent / 100)}
      data-split-separator=""
      data-orientation={orientation}
      data-focus-visible={isFocusVisible || undefined}
      className={cx(
        slots.separator,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
      {...mergeProps(moveProps, focusProps, { onKeyDown }, labelling)}
    >
      {children ?? <RiMore2Fill aria-hidden className={slots.grip} />}
    </div>
  );
};
