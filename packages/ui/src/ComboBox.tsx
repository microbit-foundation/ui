/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ForwardedRef, forwardRef, ReactNode, useRef } from "react";
import {
  Button as RACButton,
  ComboBox as RACComboBox,
  ComboBoxProps as RACComboBoxProps,
  Input as RACInput,
  Label as RACLabel,
  ListBox as RACListBox,
  Popover,
  PopoverProps,
} from "react-aria-components";
import { RiArrowDownSLine } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import { select, SelectVariantProps } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { Icon } from "./Icon";
import { SelectSlotProvider } from "./Select";

export interface ComboBoxProps<T extends object>
  extends Omit<RACComboBoxProps<T>, "className" | "children" | "style">,
    SelectVariantProps {
  /** Visible label. Use `aria-label` instead where the design has none. */
  label?: ReactNode;
  placeholder?: string;
  /**
   * Rendered inside the control, before the input — an icon for the current
   * value, say. A ComboBox's control is a text input, so unlike a Select it
   * cannot show anything but text for what is chosen; this is the way round
   * that (react-select did it with a custom `SingleValue`).
   */
  startContent?: ReactNode;
  /** `SelectOption`s. */
  children: ReactNode;
  /**
   * Replaces the chevron; pass `null` for none, which is what a plain
   * autocomplete wants (react-select's `dropdownIndicator: display none`).
   */
  indicator?: ReactNode | null;
  /**
   * Shown in place of the list when nothing matches (react-select's
   * `noOptionsMessage`). Implies `allowsEmptyCollection`, since RAC otherwise
   * closes the popover the moment the collection empties.
   */
  emptyState?: ReactNode;
  /**
   * Keep the dropdown shut until this prop is true. For gating on a minimum
   * query length — react-aria has no `minLength`, and rendering an empty list
   * still opens an empty card.
   */
  isPopoverHidden?: boolean;
  placement?: PopoverProps["placement"];
  /** Per-instance overrides for the input. */
  css?: SystemStyleObject;
  /** Per-instance overrides for the dropdown card. */
  contentCss?: SystemStyleObject;
  className?: string;
}

/**
 * ComboBox — a text input that filters a listbox, for choosing one of a known
 * set where typing to narrow it down is the point. Use Select where the list
 * is short enough to just pick from.
 *
 * Note the react-select difference this replaces: react-select filtered on
 * `label` and kept the menu open on selection unless told otherwise, whereas
 * react-aria filters on each item's `textValue` and closes on selection.
 */
const ComboBoxInner = <T extends object>(
  {
    label,
    placeholder,
    startContent,
    children,
    indicator,
    emptyState,
    isPopoverHidden,
    placement = "bottom start",
    css: cssProp,
    contentCss,
    className,
    ...props
  }: ComboBoxProps<T>,
  ref: ForwardedRef<HTMLInputElement>,
) => {
  // As Select: forward whatever variant groups the merged recipe has.
  const [variantProps, rest] = select.splitVariantProps(props);
  const slots = select(variantProps);
  // Anchor the card to the whole control, not to the bare input inside it —
  // otherwise it hangs off the text baseline and is as narrow as the input.
  const triggerRef = useRef<HTMLDivElement>(null);
  return (
    <SelectSlotProvider value={slots}>
      <RACComboBox
        allowsEmptyCollection={emptyState != null}
        {...(rest as RACComboBoxProps<T>)}
        className={cx(slots.root, className)}
      >
        {label != null && <RACLabel className={slots.label}>{label}</RACLabel>}
        <div
          ref={triggerRef}
          className={cx(slots.trigger, cssProp ? css(cssProp) : undefined)}
        >
          {startContent}
          <RACInput
            ref={ref}
            placeholder={placeholder}
            className={css({
              flex: "1",
              minWidth: 0,
              outline: "none",
              bg: "transparent",
              color: "inherit",
              font: "inherit",
              _placeholder: { color: "gray.500" },
            })}
          />
          {indicator !== null && (
            <RACButton className={slots.indicator}>
              {indicator ?? <Icon as={RiArrowDownSLine} />}
            </RACButton>
          )}
        </div>
        {!isPopoverHidden && (
          <Popover
            triggerRef={triggerRef}
            placement={placement}
            className={cx(
              slots.content,
              contentCss ? css(contentCss) : undefined,
            )}
          >
            <RACListBox
              className={slots.list}
              renderEmptyState={
                emptyState
                  ? () => <div className={slots.empty}>{emptyState}</div>
                  : undefined
              }
            >
              {children}
            </RACListBox>
          </Popover>
        )}
      </RACComboBox>
    </SelectSlotProvider>
  );
};

/**
 * forwardRef with generics needs the cast (React's types cannot express it),
 * so the ref lands on the input — call sites focus it for validation.
 */
export const ComboBox = forwardRef(ComboBoxInner) as <T extends object>(
  props: ComboBoxProps<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof ComboBoxInner>;
