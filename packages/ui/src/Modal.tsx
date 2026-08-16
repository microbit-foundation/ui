/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  CSSProperties,
  ReactNode,
  RefObject,
  useContext,
} from "react";
import {
  Button as RACButton,
  Dialog,
  DialogTrigger as RACDialogTrigger,
  Heading as RACHeading,
  Modal as RACModal,
  ModalOverlay,
  OverlayTriggerStateContext,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { dialog } from "styled-system/recipes";
import { ConditionalValue, SystemStyleObject } from "styled-system/types";
import { useIntl } from "react-intl";
import { CloseIcon } from "./CloseIcon";
import { dataAttrs } from "./data-attrs";
import { uiMessage } from "./messages";
import { UnmountCallback } from "./UnmountCallback";

type DialogSlots = ReturnType<typeof dialog>;

const SlotContext = createContext<{ slots: DialogSlots; onClose: () => void }>({
  slots: dialog({}),
  onClose: () => undefined,
});

const useDialog = () => useContext(SlotContext);

export type ModalSize = ConditionalValue<
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "full"
>;

export interface ModalOwnProps {
  size?: ModalSize;
  /** Allow closing by clicking the backdrop (default true; Escape always closes). */
  isDismissable?: boolean;
  /** Disable the enter/exit transitions. */
  motionless?: boolean;
  /** Prevent Escape closing the dialog. */
  isKeyboardDismissDisabled?: boolean;
  /** Style overrides for the dialog box. */
  contentCss?: SystemStyleObject;
  /**
   * Inline styles for the dialog box, for runtime-computed positioning that
   * Panda can't statically extract (e.g. a dialog aligned to a measured
   * element). Prefer `contentCss` for static styles.
   */
  contentStyle?: CSSProperties;
  /**
   * Style overrides for the backdrop, e.g. a transparent backdrop when
   * something else provides the dimming.
   */
  overlayCss?: SystemStyleObject;
  /** Use "alertdialog" for confirmations that interrupt the user. */
  role?: "dialog" | "alertdialog";
  /** Vertically centre the dialog. */
  isCentered?: boolean;
  /**
   * Called after the dialog has fully closed (exit transition done and the
   * dialog removed).
   */
  onCloseComplete?: () => void;
  /**
   * Element to focus when the dialog closes, instead of the element that was
   * focused when it opened.
   */
  finalFocusRef?: RefObject<HTMLElement>;
  /**
   * Accessible name for dialogs without a ModalHeader (which otherwise
   * provides the label). One of the two is required — react-aria warns in
   * dev builds when a dialog has neither. An explicit `aria-label` wins
   * over a ModalHeader.
   */
  "aria-label"?: string;
  children: ReactNode;
  /**
   * `data-*` attributes land on the dialog box, so end-to-end tests can
   * address a dialog. Shells that forward their caller's data attributes can
   * spread them straight in.
   */
  [key: `data-${string}`]: unknown;
}

/**
 * A Modal you drive yourself. Also the type for a component that *forwards*
 * modal props — `Omit<ControlledModalProps, "children">` — because a spread
 * cannot be matched against the union `ModalProps` is: TypeScript has no way
 * to know which half of it an object with `isOpen?: boolean` satisfies.
 */
export type ControlledModalProps = ModalOwnProps & {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when the dialog asks to close. */
  onClose: () => void;
};

/**
 * The props of a `Modal`: its own, plus an open state that is either entirely
 * yours or entirely a `DialogTrigger`'s. Never half of each — `isOpen`
 * without `onClose` leaves the close button and Escape with nothing to call,
 * so the pair is enforced rather than merely documented.
 */
export type ModalProps =
  | ControlledModalProps
  | (ModalOwnProps & { isOpen?: never; onClose?: never });

/**
 * Modal — a focus-trapping dialog in a single shell; place ModalHeader,
 * ModalBody and ModalFooter inside.
 *
 * Two ways to drive it:
 *
 * - **Controlled** (`isOpen` + `onClose`), which is what any dialog with more
 *   than one opener needs — a menu item and a toolbar button opening the same
 *   dialog, or one opened from a handler after an async result.
 * - **Inside a `DialogTrigger`**, with neither prop: react-aria holds the
 *   open state, the trigger opens it, and `ModalCloseButton` and the footer's
 *   `useDialogClose()` still close it. Prefer this where a dialog has exactly
 *   one trigger sitting next to it — there is no state to hold, and none to
 *   get out of step.
 */
export const Modal = ({
  isOpen,
  onClose,
  size,
  isDismissable = true,
  motionless,
  isKeyboardDismissDisabled,
  contentCss,
  contentStyle,
  overlayCss,
  role,
  isCentered,
  onCloseComplete,
  finalFocusRef,
  "aria-label": ariaLabel,
  children,
  ...rest
}: ModalProps) => {
  // Set by a DialogTrigger (or any react-aria overlay trigger) above us. When
  // `isOpen` is given it is ignored: RAC's ModalOverlay prefers an explicit
  // prop over the context, and so do we for the close function.
  const triggerState = useContext(OverlayTriggerStateContext);
  const close = onClose ?? (() => triggerState?.close());
  const dataProps = dataAttrs(rest);
  const slots = dialog({ size, centered: isCentered });
  const motionlessClass = motionless
    ? css({
        transition: "none",
        "&[data-entering]": { opacity: 1, transform: "none" },
        "&[data-exiting]": { opacity: 1, transform: "none" },
      })
    : undefined;
  const handleUnmount = () => {
    onCloseComplete?.();
    const el = finalFocusRef?.current;
    if (el) {
      // After RAC's own focus restoration, which also runs on unmount.
      requestAnimationFrame(() => el.focus());
    }
  };
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      // Marker for the html:has() rule in base-preset.ts that releases the
      // scroll lock's reserved scrollbar gutter while a full-size dialog is
      // open: the reserved strip is a hit-testing dead zone (clicks fall
      // through to the root and read as outside-dismissal), and the page
      // reflowing behind an opaque full-screen dialog is invisible.
      data-fullsize={size === "full" || undefined}
      className={cx(
        slots.overlay,
        motionlessClass,
        overlayCss ? css(overlayCss) : undefined,
      )}
    >
      <UnmountCallback callback={handleUnmount} />
      <RACModal
        {...dataProps}
        style={contentStyle}
        className={cx(
          slots.content,
          motionlessClass,
          contentCss ? css(contentCss) : undefined,
        )}
      >
        <Dialog role={role} aria-label={ariaLabel} className={slots.inner}>
          <SlotContext.Provider value={{ slots, onClose: close }}>
            {children}
          </SlotContext.Provider>
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
};

/**
 * DialogTrigger — react-aria-components' <DialogTrigger>: wrap a trigger
 * element and a `Modal`, and the open state is theirs rather than yours.
 *
 * ```tsx
 * <DialogTrigger>
 *   <Button>Settings</Button>
 *   <Modal size="lg">
 *     <ModalHeader>Settings</ModalHeader>
 *     …
 *   </Modal>
 * </DialogTrigger>
 * ```
 *
 * Only for a dialog with a single trigger beside it. A dialog opened from
 * more than one place, from a menu item (which cannot hold a dialog — a
 * non-collection child truncates the menu), or from a handler, wants the
 * controlled `Modal` instead.
 */
export const DialogTrigger = RACDialogTrigger;

/**
 * The current dialog's close function — the same one `ModalCloseButton` uses,
 * for a footer's own Cancel/Done buttons. Works in both modes, so a dialog's
 * content need not know which is driving it.
 */
export const useDialogClose = () => useDialog().onClose;

interface SlotProps {
  children?: ReactNode;
  css?: SystemStyleObject;
  className?: string;
  /** `data-*` attributes land on the slot element. */
  [key: `data-${string}`]: unknown;
}

/** Modal title. Rendered as RAC's labelling heading for the dialog. */
export const ModalHeader = ({
  children,
  css: cssProp,
  className,
  level,
  ...rest
}: SlotProps & {
  /**
   * Heading element level. Defaults to 2: RAC's Dialog supplies that through
   * HeadingContext for the `title` slot, not the bare Heading default of 3.
   */
  level?: number;
}) => {
  const { slots } = useDialog();
  return (
    <RACHeading
      {...dataAttrs(rest)}
      slot="title"
      level={level}
      className={cx(
        slots.header,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
    >
      {children}
    </RACHeading>
  );
};

export const ModalBody = ({
  children,
  css: cssProp,
  className,
  ...rest
}: SlotProps) => {
  const { slots } = useDialog();
  return (
    <div
      {...dataAttrs(rest)}
      className={cx(slots.body, cssProp ? css(cssProp) : undefined, className)}
    >
      {children}
    </div>
  );
};

export const ModalFooter = ({
  children,
  css: cssProp,
  className,
  ...rest
}: SlotProps) => {
  const { slots } = useDialog();
  return (
    <div
      {...dataAttrs(rest)}
      className={cx(
        slots.footer,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
    >
      {children}
    </div>
  );
};

export interface ModalCloseButtonProps {
  /** Accessible name; defaults to the localized close label. */
  "aria-label"?: string;
  /** `data-*` attributes land on the button. */
  [key: `data-${string}`]: unknown;
}

/**
 * ModalCloseButton — the X in the dialog's top corner. Closes via the Modal's
 * onClose.
 */
export const ModalCloseButton = ({
  "aria-label": ariaLabel,
  ...rest
}: ModalCloseButtonProps) => {
  const intl = useIntl();
  const { slots, onClose } = useDialog();
  return (
    <RACButton
      {...dataAttrs(rest)}
      aria-label={ariaLabel ?? intl.formatMessage(uiMessage("ui.close-action"))}
      onPress={onClose}
      className={cx(
        slots.closeTrigger,
        css({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "8",
          height: "8",
          fontSize: "xs",
          borderRadius: "md",
          cursor: "pointer",
          bg: "transparent",
          border: "none",
          color: "inherit",
          outline: "none",
          transitionProperty: "background-color, box-shadow",
          transitionDuration: "normal",
          _hover: { bg: "closeButton.bgHover" },
          _active: { bg: "closeButton.bgActive" },
          _focusVisible: { focusRing: "outline" },
        }),
      )}
    >
      <CloseIcon />
    </RACButton>
  );
};
