/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  CSSProperties,
  ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import {
  Button as RACButton,
  UNSTABLE_Toast as RACToast,
  UNSTABLE_ToastContent as RACToastContent,
  UNSTABLE_ToastQueue as RACToastQueue,
  UNSTABLE_ToastRegion as RACToastRegion,
} from "react-aria-components";
import { useIntl } from "react-intl";
import { IconType } from "react-icons/lib";
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
} from "react-icons/ri";
import { toast as toastRecipe } from "styled-system/recipes";
import { CloseIcon } from "./CloseIcon";
import { Icon } from "./Icon";
import { uiMessage } from "./messages";
import { VisuallyHidden } from "./VisuallyHidden";

export type ToastStatus = "info" | "success" | "warning" | "error";

export interface ToastContent {
  /** Dedup key: adding a toast whose id is already visible is a no-op. */
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  status?: ToastStatus;
  isClosable?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Set while a close is animating. Only one view transition can run at a time,
// and the reflow below has to keep out of its way — the transition animates
// the surviving toasts to their new positions itself.
let closing = false;

/**
 * Runs a *closing* queue update inside a view transition, so the toast can
 * animate out after RAC has unmounted it (see the ::view-transition-old rule
 * in base-preset.ts).
 *
 * Adds deliberately skip the view transition, because snapshotting an
 * entering toast costs more than it buys: the toast is already in the DOM and
 * can animate itself from the recipe, whereas a snapshot's geometry is
 * rounded to device pixels and visibly shifted a centred toast on the handoff
 * back to the live element. The reflow that the transition would have given
 * us for free is done by useToastReflow instead.
 *
 * flushSync is required: startViewTransition captures the "after" state when
 * its callback returns, so React has to have committed by then.
 */
const wrapUpdate = (fn: () => void, action: "add" | "remove" | "clear") => {
  if (
    action === "add" ||
    typeof document === "undefined" ||
    !("startViewTransition" in document) ||
    prefersReducedMotion() ||
    // Starting a second transition skips the running one mid-animation, which
    // reads as toasts snapping out of existence. Let this close through
    // unanimated rather than wrecking the one already on screen.
    closing
  ) {
    fn();
    return;
  }
  closing = true;
  const transition = document.startViewTransition(() => {
    flushSync(fn);
  });
  void transition.finished
    .catch(() => undefined)
    .finally(() => {
      closing = false;
    });
};

// Module-level queue shared by useToast() and the <ToastProvider/> region.
// (RAC's Toast API is still flagged UNSTABLE_*; the surface is small and behind
// this module, so a swap to a custom queue later is contained.)
export const toastQueue = new RACToastQueue<ToastContent>({
  maxVisibleToasts: 5,
  wrapUpdate,
});

// Status icon matching Chakra's AlertIcon (filled glyphs, coloured by the
// toast foreground = white here). Warning is a triangle, error a circle, as
// in Chakra — the glyph must distinguish them because the colours alone
// don't reliably. The icon is decorative; the status is announced via the
// visually hidden status text.
const statusIcon: Record<ToastStatus, IconType> = {
  info: RiInformationFill,
  success: RiCheckboxCircleFill,
  warning: RiAlertFill,
  error: RiErrorWarningFill,
};

// Module scope so useSyncExternalStore doesn't resubscribe every render.
const subscribeToQueue = (fn: () => void) => toastQueue.subscribe(fn);
const getVisibleToasts = () => toastQueue.visibleToasts;

/**
 * Slides the toasts already on screen to their new positions when another one
 * is added, instead of letting them jump.
 *
 * Returns the element map to populate from the toasts' refs.
 */
const useToastReflow = () => {
  const elements = useRef(new Map<string, HTMLElement>());
  const previousTops = useRef(new Map<string, number>());
  // No dependency array: every commit is a chance for the list to have moved.
  useLayoutEffect(() => {
    const tops = new Map<string, number>();
    elements.current.forEach((element, key) => {
      // offsetTop rather than getBoundingClientRect: it reports the laid-out
      // position and ignores transforms, so measuring a toast that is midway
      // through one of these animations still gives its resting position.
      // The region is `position: fixed`, so it is the offsetParent and never
      // moves itself.
      const top = element.offsetTop;
      const previous = previousTops.current.get(key);
      tops.set(key, top);
      if (
        previous === undefined ||
        previous === top ||
        // A closing toast's view transition animates this same reflow.
        closing
      ) {
        return;
      }
      // Put the toast back where it was, with the recipe's transition
      // suppressed so it gets there instantly...
      element.style.transition = "none";
      element.style.transform = `translateY(${previous - top}px)`;
      // ...flush that, or restoring the transition below would coalesce with
      // it into a single no-op style change...
      void element.offsetHeight;
      // ...then hand back to the recipe, whose transform transition carries
      // the toast to its new position. (It is also where prefers-reduced-
      // motion turns this into the instant jump.)
      element.style.transition = "";
      element.style.transform = "";
    });
    previousTops.current = tops;
  });
  return elements;
};

/**
 * Mount once near the app root, inside the IntlProvider (the close button's
 * label and the status announcements are react-intl messages).
 * Renders the live region that announces and displays queued toasts.
 */
export const ToastProvider = () => {
  const intl = useIntl();
  const slots = toastRecipe();
  const reflowElements = useToastReflow();
  // The region's landmark label counts the visible toasts, so it has to
  // track the queue.
  const count = useSyncExternalStore(
    subscribeToQueue,
    getVisibleToasts,
    getVisibleToasts,
  ).length;
  return (
    <RACToastRegion
      queue={toastQueue}
      aria-label={intl.formatMessage(uiMessage("ui.toast-region"), { count })}
      className={slots.region}
    >
      {({ toast }) => {
        const status = toast.content.status ?? "info";
        return (
          <RACToast
            toast={toast}
            className={toastRecipe({ status }).root}
            // Pulls this toast out of the page-wide snapshot when it closes,
            // so it animates out independently. RAC's keys are `_`-prefixed,
            // so they are already valid custom-idents.
            style={{ viewTransitionName: toast.key } as CSSProperties}
            ref={(element) => {
              if (element) {
                reflowElements.current.set(toast.key, element);
              } else {
                reflowElements.current.delete(toast.key);
              }
            }}
          >
            <Icon as={statusIcon[status]} className={slots.icon} aria-hidden />
            <RACToastContent>
              {/* Colour and icon are the only visible status signals; say it
                  for assistive tech too. */}
              <VisuallyHidden>
                {intl.formatMessage(uiMessage(`ui.toast-status-${status}`))}{" "}
              </VisuallyHidden>
              {toast.content.title && (
                <p className={slots.title}>{toast.content.title}</p>
              )}
              {toast.content.description && (
                <div className={slots.description}>
                  {toast.content.description}
                </div>
              )}
            </RACToastContent>
            {toast.content.isClosable && (
              <RACButton
                slot="close"
                aria-label={intl.formatMessage(uiMessage("ui.close-action"))}
                className={slots.closeButton}
              >
                <CloseIcon />
              </RACButton>
            )}
          </RACToast>
        );
      }}
    </RACToastRegion>
  );
};

export interface ToastOptions extends ToastContent {
  /** Auto-dismiss after this many ms. Default 5000. Ignored when `persistent`. */
  duration?: number;
  /**
   * Never auto-dismiss. The close button is forced on so the toast is not
   * permanent and unremovable.
   */
  persistent?: boolean;
}

export interface ToastFn {
  (options: ToastOptions): void;
  /** Whether a toast with this id is currently visible. */
  isActive(id: string): boolean;
  /**
   * Replace a visible toast's content (Chakra's toast.update). The toast is
   * re-added, so unlike Chakra it re-animates and restarts any timeout.
   */
  update(id: string, options: ToastOptions): void;
  /** Dismiss all visible toasts (Chakra's toast.closeAll). */
  closeAll(): void;
}

/**
 * useToast — imperative toast trigger in the shape of Chakra's `useToast()`
 * call sites: `toast({ title, description, status, duration })`. Unlike
 * Chakra there is no `duration: null`; use `persistent: true` instead.
 */
export const useToast = (): ToastFn =>
  useMemo(() => {
    const isActive = (id: string) =>
      toastQueue.visibleToasts.some((t) => t.content.id === id);
    const add = ({
      id,
      title,
      description,
      status,
      isClosable,
      duration,
      persistent,
    }: ToastOptions) => {
      if (id && isActive(id)) {
        return;
      }
      toastQueue.add(
        {
          id,
          title,
          description,
          status,
          isClosable: isClosable || persistent,
        },
        { timeout: persistent ? undefined : duration ?? 5000 },
      );
    };
    const update = (id: string, options: ToastOptions) => {
      const existing = toastQueue.visibleToasts.find(
        (t) => t.content.id === id,
      );
      if (existing) {
        toastQueue.close(existing.key);
      }
      add({ ...options, id });
    };
    const closeAll = () => {
      // Copy first: closing mutates visibleToasts as we iterate.
      [...toastQueue.visibleToasts].forEach((t) => toastQueue.close(t.key));
    };
    return Object.assign(add, { isActive, update, closeAll });
  }, []);
