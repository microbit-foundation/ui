/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext } from "react";
import {
  Button as RACButton,
  Label as RACLabel,
  ListBox as RACListBox,
  ListBoxItem as RACListBoxItem,
  ListBoxItemProps as RACListBoxItemProps,
  Popover,
  PopoverProps,
  Select as RACSelect,
  SelectProps as RACSelectProps,
  SelectValue,
} from "react-aria-components";
import { RiArrowDownSLine } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import { select, SelectVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { Icon } from "./Icon";

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
    SelectVariantProps {
  /** Visible label. Use `aria-label` instead where the design has none. */
  label?: ReactNode;
  /** Shown in the trigger while nothing is chosen (Chakra's placeholder). */
  placeholder?: string;
  /** `SelectOption`s. */
  children: ReactNode;
  /** Replaces the chevron. */
  indicator?: ReactNode;
  /** Placement of the dropdown relative to the trigger. */
  placement?: PopoverProps["placement"];
  /**
   * Cap the dropdown's height (react-select's `maxMenuHeight`). A prop rather
   * than a `contentCss` rule because RAC writes its own max-height inline
   * while positioning, which beats any class.
   */
  maxHeight?: number;
  /** Per-instance overrides for the trigger. */
  css?: SystemStyleObject;
  /** Per-instance overrides for the dropdown card. */
  contentCss?: SystemStyleObject;
  className?: string;
}

/**
 * Select — a listbox behind a button, for choosing one of a known set.
 * Replaces Chakra-era react-select at non-searchable call sites; use ComboBox
 * where the user should be able to type to filter.
 */
export const Select = <T extends object>({
  label,
  placeholder,
  children,
  indicator,
  placement = "bottom start",
  maxHeight,
  css: cssProp,
  contentCss,
  className,
  ...props
}: SelectProps<T>) => {
  // splitVariantProps, not a hand-picked list: an app preset can add variant
  // groups to the recipe and they have to reach it (playbook gotcha #37).
  const [variantProps, rest] = select.splitVariantProps(props);
  const slots = select(variantProps);
  return (
    <SelectSlotProvider value={slots}>
      <RACSelect
        {...(rest as RACSelectProps<T>)}
        className={cx(slots.root, className)}
      >
        {label != null && <RACLabel className={slots.label}>{label}</RACLabel>}
        <RACButton
          className={cx(slots.trigger, cssProp ? css(cssProp) : undefined)}
        >
          <SelectValue className={slots.value}>
            {({ isPlaceholder, defaultChildren }) =>
              isPlaceholder ? placeholder ?? "" : defaultChildren
            }
          </SelectValue>
          <span className={slots.indicator} aria-hidden>
            {indicator ?? <Icon as={RiArrowDownSLine} />}
          </span>
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
