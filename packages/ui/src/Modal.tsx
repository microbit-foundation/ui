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
  Heading as RACHeading,
  Modal as RACModal,
  ModalOverlay,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { dialog } from "styled-system/recipes";
import { ConditionalValue, SystemStyleObject } from "styled-system/types";
import { useIntl } from "react-intl";
import { CloseIcon } from "./CloseIcon";
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

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  /** Allow closing by clicking the backdrop (default true; Escape always closes). */
  isDismissable?: boolean;
  /** Disable the enter/exit transitions (Chakra's motionPreset="none"). */
  motionless?: boolean;
  /** Prevent Escape closing the dialog (Chakra's closeOnEsc={false}). */
  isKeyboardDismissDisabled?: boolean;
  /** Style overrides for the dialog box (Chakra's ModalContent props). */
  contentCss?: SystemStyleObject;
  /**
   * Inline styles for the dialog box, for runtime-computed positioning that
   * Panda can't statically extract (e.g. a dialog aligned to a measured
   * element). Prefer `contentCss` for static styles.
   */
  contentStyle?: CSSProperties;
  /**
   * Style overrides for the backdrop (Chakra's ModalOverlay props), e.g. a
   * transparent backdrop when something else provides the dimming.
   */
  overlayCss?: SystemStyleObject;
  /**
   * Use "alertdialog" for confirmations that interrupt the user (Chakra's
   * AlertDialog).
   */
  role?: "dialog" | "alertdialog";
  /** Vertically centre the dialog (Chakra's `isCentered`). */
  isCentered?: boolean;
  /**
   * Called after the dialog has fully closed (exit transition done and the
   * dialog removed). Matches Chakra's `onCloseComplete`.
   */
  onCloseComplete?: () => void;
  /**
   * Element to focus when the dialog closes, instead of the element that was
   * focused when it opened. Matches Chakra's `finalFocusRef`.
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
   * `data-*` attributes land on the dialog box (where Chakra's went, on
   * ModalContent), so end-to-end tests can address a dialog. Shells that
   * forward their caller's data attributes can spread them straight in.
   */
  [key: `data-${string}`]: unknown;
}

/**
 * Modal — a focus-trapping dialog. Collapses Chakra's
 * Modal/ModalOverlay/ModalContent into a single shell; place ModalHeader,
 * ModalBody and ModalFooter inside.
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
          onClose();
        }
      }}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
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
          <SlotContext.Provider value={{ slots, onClose }}>
            {children}
          </SlotContext.Provider>
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
};

interface SlotProps {
  children?: ReactNode;
  css?: SystemStyleObject;
  className?: string;
  /** `data-*` attributes land on the slot element, as they did on Chakra's. */
  [key: `data-${string}`]: unknown;
}

const dataAttrs = (props: object) =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith("data-")),
  );

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
 * ModalCloseButton — the X in the dialog's top corner (Chakra's
 * ModalCloseButton at its default md size). Closes via the Modal's onClose.
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
          _hover: { bg: "blackAlpha.100" },
          _active: { bg: "blackAlpha.200" },
          _focusVisible: { focusShadow: "outline" },
        }),
      )}
    >
      <CloseIcon />
    </RACButton>
  );
};
