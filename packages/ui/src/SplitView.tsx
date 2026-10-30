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
  PointerEvent,
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
 * - `open`: the primary pane is resizable and the splitter is shown.
 * - `compact`: the primary pane is fixed at `compactSize`, with no splitter
 *   (e.g. a sidebar reduced to an icon rail).
 * - `collapsed`: the primary pane is hidden (kept mounted, but out of the
 *   tab order and accessibility tree), with no splitter.
 *
 * Focus is the app's to manage when the mode changes. Leaving `open`
 * unmounts the splitter, so if it had focus (say a keyboard shortcut changed
 * the mode) focus drops to the document body; collapsing leaves focus inside
 * the primary pane on a hidden element. Move it to the control that changed
 * the mode, or into the secondary pane.
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
  primaryMinSize: number;
  primaryMaxSize: number;
  setSize: (size: number) => void;
  commitSize: () => void;
  setDragging: (dragging: boolean) => void;
  setPrimaryPaneId: (id: string | undefined) => void;
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
  primaryMinSize?: number;
  /** The primary pane's maximum size in px. */
  primaryMaxSize?: number;
  /**
   * The secondary pane's minimum size in px. When the container is too small
   * for both minimums, the primary pane keeps its minimum and the secondary
   * gives way.
   */
  secondaryMinSize?: number;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  /**
   * Two `SplitViewPane`s, one marked `primary`, with a `SplitViewSplitter`
   * between them. Either pane may be the primary.
   */
  children: ReactNode;
}

/**
 * SplitView — two panes with a splitter that resizes one of them: the
 * primary pane has an explicit size, and the secondary takes the rest. A
 * WAI-ARIA window splitter: the splitter is focusable, resizes with the
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
  primaryMinSize = 0,
  primaryMaxSize = Infinity,
  secondaryMinSize = 0,
  css: cssProp,
  className,
  children,
  ...rest
}: SplitViewProps) => {
  const slots = splitView();
  const rootRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const [primaryPaneId, setPrimaryPaneId] = useState<string>();
  const primaryId = primaryPaneId ?? generatedId;
  const [uncontrolledSize, setUncontrolledSize] = useState(
    defaultSize ?? primaryMinSize,
  );
  const requestedSize = size ?? uncontrolledSize;
  // Container content size less the splitter and gaps. Undefined until
  // measured, and while the container has no size (e.g. inside a hidden
  // tab), so the primary pane isn't clamped to nothing.
  const [available, setAvailable] = useState<number>();
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    // Layout sizes rather than bounding rects, which a transformed ancestor
    // would scale.
    const measure = () => {
      const sideBySide = orientation === "vertical";
      const style = getComputedStyle(root);
      const px = (value: string) => parseFloat(value) || 0;
      const content = sideBySide
        ? root.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
        : root.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
      const gaps =
        Math.max(root.children.length - 1, 0) *
        px(sideBySide ? style.columnGap : style.rowGap);
      const splitter = root.querySelector<HTMLElement>(
        ":scope > [data-splitter]",
      );
      const splitterSize = splitter
        ? sideBySide
          ? splitter.offsetWidth
          : splitter.offsetHeight
        : 0;
      setAvailable(content > 0 ? content - gaps - splitterSize : undefined);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
    // `mode` because the splitter only renders when open.
  }, [orientation, mode]);

  const max =
    available === undefined
      ? Math.max(primaryMinSize, primaryMaxSize)
      : Math.max(
          primaryMinSize,
          Math.min(primaryMaxSize, available - secondaryMinSize),
        );
  const primarySize = clamp(requestedSize, primaryMinSize, max);

  const latestSize = useRef(primarySize);
  const callbacks = useRef({ onSizeChange, onSizeChangeEnd });
  useLayoutEffect(() => {
    latestSize.current = primarySize;
    callbacks.current = { onSizeChange, onSizeChangeEnd };
  });
  const isControlled = size !== undefined;
  // A key press that doesn't move the splitter (an arrow across the split
  // axis, Home at the minimum) still ends a move, but has nothing to persist.
  const uncommitted = useRef(false);

  const setSize = useCallback(
    (next: number) => {
      if (next === latestSize.current) {
        return;
      }
      latestSize.current = next;
      uncommitted.current = true;
      if (!isControlled) {
        setUncontrolledSize(next);
      }
      callbacks.current.onSizeChange?.(next);
    },
    [isControlled],
  );
  const commitSize = useCallback(() => {
    if (!uncommitted.current) {
      return;
    }
    uncommitted.current = false;
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
      primaryMinSize,
      primaryMaxSize: max,
      setSize,
      commitSize,
      setDragging,
      setPrimaryPaneId,
    }),
    [
      orientation,
      mode,
      compactSize,
      primaryId,
      primarySize,
      primaryMinSize,
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
   * The pane the splitter sizes; exactly one pane is primary. The splitter's
   * `aria-controls` names its `id`, generated unless given.
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
  const {
    orientation,
    mode,
    compactSize,
    primaryId,
    primaryRef,
    primarySize,
    setPrimaryPaneId,
  } = useSplitViewContext("SplitViewPane");
  const id = rest.id;
  useLayoutEffect(() => {
    if (primary && id) {
      setPrimaryPaneId(id);
      return () => setPrimaryPaneId(undefined);
    }
  }, [primary, id, setPrimaryPaneId]);
  let sizeStyle: CSSProperties | undefined;
  if (primary) {
    const extent =
      mode === "open" ? primarySize : mode === "compact" ? compactSize : 0;
    sizeStyle =
      orientation === "vertical" ? { width: extent } : { height: extent };
    if (mode === "collapsed") {
      // Inline, as a recipe rule would lose to padding or a border from the
      // pane's `css`, leaving a gap where the pane was.
      Object.assign(sizeStyle, {
        padding: 0,
        borderWidth: 0,
        minWidth: 0,
        minHeight: 0,
      });
    }
  }
  return (
    <div
      {...rest}
      ref={primary ? primaryRef : undefined}
      id={id ?? (primary ? primaryId : undefined)}
      data-primary={primary || undefined}
      data-collapsed={(primary && mode === "collapsed") || undefined}
      className={cx(slots.pane, cssProp ? css(cssProp) : undefined, className)}
      style={sizeStyle ? { ...style, ...sizeStyle } : style}
    >
      {children}
    </div>
  );
};

type SplitterLabelling =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type SplitViewSplitterProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "role"
  | "children"
  | "aria-label"
  | "aria-labelledby"
  | "aria-orientation"
  | "aria-controls"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
  | "aria-valuetext"
> &
  SplitterLabelling & {
    /** Per-instance style overrides, merged after the recipe. */
    css?: SystemStyleObject;
    /** Replaces the default grip icon. */
    children?: ReactNode;
  };

/**
 * The splitter between the panes. Renders only in `open` mode. Needs an
 * accessible name: label it by what it resizes ("Resize sidebar"), or point
 * `aria-labelledby` at the primary pane's visible heading.
 *
 * Event handlers chain with the splitter's own, so an app can add the
 * pattern's optional Enter to collapse and restore, or a double-click reset.
 */
export const SplitViewSplitter = ({
  css: cssProp,
  className,
  children,
  ...rest
}: SplitViewSplitterProps) => {
  const slots = splitView();
  const {
    orientation,
    mode,
    primaryId,
    primaryRef,
    primarySize,
    primaryMinSize,
    primaryMaxSize,
    setSize,
    commitSize,
    setDragging,
  } = useSplitViewContext("SplitViewSplitter");
  const { locale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  // +1 when moving the splitter right/down grows the primary pane.
  const growth = useRef(1);
  const sideBySide = orientation === "vertical";
  const { isFocusVisible, focusProps } = useFocusRing();
  // Set on press rather than from useMove, which only starts a move once the
  // pointer moves.
  const [pressed, setPressed] = useState(false);

  const { moveProps } = useMove({
    onMoveStart(e) {
      position.current = primarySize;
      // Measured rather than derived from DOM order and text direction:
      // the layout already accounts for both.
      const primary = primaryRef.current?.getBoundingClientRect();
      const splitter = ref.current?.getBoundingClientRect();
      if (primary && splitter) {
        const centre = (r: DOMRect) =>
          sideBySide ? r.left + r.width / 2 : r.top + r.height / 2;
        growth.current = centre(primary) < centre(splitter) ? 1 : -1;
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
      // and back doesn't shift the splitter relative to the pointer.
      position.current += delta * growth.current;
      setSize(clamp(position.current, primaryMinSize, primaryMaxSize));
    },
    onMoveEnd() {
      setDragging(false);
      commitSize();
    },
  });

  // Capture routes the drag's events, and its cursor, to the splitter
  // wherever the pointer goes; an iframe would otherwise swallow them. Its
  // loss marks the end of the press, moved or not. jsdom lacks it.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setPressed(true);
    }
  };
  const onLostPointerCapture = () => setPressed(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Home") {
      e.preventDefault();
      setSize(primaryMinSize);
      commitSize();
    } else if (e.key === "End" && Number.isFinite(primaryMaxSize)) {
      e.preventDefault();
      setSize(primaryMaxSize);
      commitSize();
    }
  };

  if (mode !== "open") {
    return null;
  }
  const range = primaryMaxSize - primaryMinSize;
  const percent =
    Number.isFinite(range) && range > 0
      ? Math.round(((primarySize - primaryMinSize) / range) * 100)
      : 0;
  // Known gap: TalkBack doesn't send swipe adjustments to a role="separator". A
  // visually hidden range input fixes that (react-aria's column resizer
  // does it), at the cost of desktop screen readers announcing a slider.
  return (
    <div
      {...mergeProps(rest, moveProps, focusProps, {
        onKeyDown,
        onPointerDown,
        onLostPointerCapture,
      })}
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
      data-splitter=""
      data-orientation={orientation}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={pressed || undefined}
      className={cx(
        slots.splitter,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
    >
      {children ?? <RiMore2Fill aria-hidden className={slots.grip} />}
    </div>
  );
};
