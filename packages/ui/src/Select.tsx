/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext } from "react";
import {
  Button as RACButton,
  ListBox as RACListBox,
  ListBoxItem as RACListBoxItem,
  ListBoxItemProps as RACListBoxItemProps,
  Popover,
  PopoverProps,
  Select as RACSelect,
  SelectProps as RACSelectProps,
  SelectValue,
} from "react-aria-components";
import { useIntl } from "react-intl";
import { RiArrowDownSLine } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import { field, select, SelectVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import {
  FieldLabel,
  FieldLayoutProps,
  FieldSupport,
  FieldSupportProps,
} from "./Field";
import { Icon } from "./Icon";
import { uiMessage } from "./messages";

export type SelectSlots = ReturnType<typeof select>;

// Options are children, so they can't see the variant their Select was given.
// The parent hands its resolved slots down, as Modal does for its own slots.
const SlotContext = createContext<SelectSlots>(select({}));

export const useSelectSlots = () => useContext(SlotContext);

export const SelectSlotProvider = SlotContext.Provider;

export interface SelectProps<T extends object>
  extends Omit<
      RACSelectProps<T>,
      "className" | "children" | "style" | "placeholder"
    >,
    SelectVariantProps,
    FieldSupportProps,
    FieldLayoutProps {
  /** Visible label. Use `aria-label` instead where the design has none. */
  label?: ReactNode;
  /** Label style overrides. */
  labelCss?: SystemStyleObject;
  /**
   * Shown in the trigger while nothing is chosen. Defaults to a translated
   * "Select an item".
   */
  placeholder?: string;
  /** `SelectOption`s. */
  children: ReactNode;
  /**
   * Replaces the chevron; `null` removes it. Rarely right on a Select — the
   * chevron is the only thing marking its trigger as a dropdown rather than
   * a label, where a ComboBox's text input speaks for itself (which is why
   * classroom's chevron-less autocomplete is a ComboBox).
   */
  indicator?: ReactNode | null;
  /** Placement of the dropdown relative to the trigger. */
  placement?: PopoverProps["placement"];
  /**
   * Cap the dropdown's height. A prop rather than a `contentCss` rule because
   * RAC writes its own max-height inline while positioning, which beats any
   * class.
   */
  maxHeight?: number;
  /** Per-instance overrides for the trigger (the button the value sits in). */
  triggerCss?: SystemStyleObject;
  /** Per-instance overrides for the dropdown card. */
  contentCss?: SystemStyleObject;
  className?: string;
}

/**
 * Select — a listbox behind a button, for choosing one of a known set. Use
 * ComboBox where the user should be able to type to filter.
 */
export const Select = <T extends object>({
  label,
  labelCss,
  placeholder,
  children,
  indicator,
  placement = "bottom start",
  maxHeight,
  helperText,
  errorMessage,
  helperTextCss,
  labelPosition,
  triggerCss,
  contentCss,
  className,
  ...props
}: SelectProps<T>) => {
  // splitVariantProps, not a hand-picked list: an app preset can add variant
  // groups to the recipe and they have to reach it.
  const [variantProps, rest] = select.splitVariantProps(props);
  const intl = useIntl();
  const slots = select(variantProps);
  const fieldSlots = field({ size: variantProps.size, labelPosition });
  return (
    <SelectSlotProvider value={slots}>
      <RACSelect
        {...rest}
        className={cx(fieldSlots.root, slots.root, className)}
      >
        {label != null && (
          <FieldLabel
            size={variantProps.size}
            labelPosition={labelPosition}
            isRequired={props.isRequired}
            css={labelCss}
          >
            {label}
          </FieldLabel>
        )}
        <RACButton
          className={cx(
            slots.trigger,
            triggerCss ? css(triggerCss) : undefined,
          )}
        >
          <SelectValue className={slots.value}>
            {({ isPlaceholder, defaultChildren }) =>
              isPlaceholder
                ? placeholder ??
                  intl.formatMessage(uiMessage("ui.select-placeholder"))
                : defaultChildren
            }
          </SelectValue>
          {indicator !== null && (
            <span className={slots.indicator} aria-hidden>
              {indicator ?? <Icon as={RiArrowDownSLine} />}
            </span>
          )}
        </RACButton>
        <Popover
          placement={placement}
          maxHeight={maxHeight}
          className={cx(
            slots.content,
            contentCss ? css(contentCss) : undefined,
          )}
        >
          <RACListBox className={slots.list}>{children}</RACListBox>
        </Popover>
        <FieldSupport
          helperText={helperText}
          errorMessage={errorMessage}
          helperTextCss={helperTextCss}
          labelPosition={labelPosition}
        />
      </RACSelect>
    </SelectSlotProvider>
  );
};

export interface SelectOptionProps
  extends Omit<RACListBoxItemProps, "className" | "children" | "style"> {
  children?: ReactNode;
  css?: SystemStyleObject;
  className?: string;
}

/** A row in a `Select` or `ComboBox` list. */
export const SelectOption = ({
  children,
  css: cssProp,
  className,
  ...rest
}: SelectOptionProps) => {
  const slots = useSelectSlots();
  return (
    <RACListBoxItem
      {...rest}
      className={cx(
        slots.option,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
    >
      {children}
    </RACListBoxItem>
  );
};
