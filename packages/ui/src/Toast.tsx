/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, useMemo, useSyncExternalStore } from "react";
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

// Enter/exit/reflow animation: queue updates run inside a view transition
// (react-aria's supported mechanism — toasts unmount synchronously, so CSS
// transitions on the element can't animate the exit). The keyframes and the
// ::view-transition rules live in base-preset.ts, scoped by this class,
// which marks the transition as toast-initiated while it runs: the rules
// select entering/exiting groups with `(*)`, avoiding view-transition-class
// (needs Safari 18.2/Chrome 125 vs 18.0/111 for the API itself), and the
// scoping keeps them — and the pointer-events override — away from any view
// transitions the app runs. Browsers without the API and reduced-motion
// users get the bare update.
const TRANSITION_CLASS = "microbit-ui-toast-transition";
let activeTransitions = 0;
const wrapUpdate = (fn: () => void) => {
  if (
    typeof document !== "undefined" &&
    document.startViewTransition &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    activeTransitions++;
    document.documentElement.classList.add(TRANSITION_CLASS);
    const transition = document.startViewTransition(fn);
    transition.finished.finally(() => {
      if (--activeTransitions === 0) {
        document.documentElement.classList.remove(TRANSITION_CLASS);
      }
    });
  } else {
    fn();
  }
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
const getVisibleCount = () => toastQueue.visibleToasts.length;

/**
 * Mount once near the app root, inside the IntlProvider (the close button's
 * label and the status announcements are react-intl messages).
 * Renders the live region that announces and displays queued toasts.
 */
export const ToastProvider = () => {
  const intl = useIntl();
  const slots = toastRecipe();
  // The region's landmark label counts the visible toasts, so it has to
  // track the queue.
  const count = useSyncExternalStore(
    subscribeToQueue,
    getVisibleCount,
    getVisibleCount,
  );
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
            // A unique view-transition-name per toast creates its snapshot
            // group and lets old/new pair up across the transition.
            style={{ viewTransitionName: toast.key }}
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
