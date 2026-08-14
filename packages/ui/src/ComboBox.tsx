/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Button as RACButton,
  ComboBox as RACComboBox,
  ComboBoxProps as RACComboBoxProps,
  Input as RACInput,
  ListBox as RACListBox,
  Popover,
  PopoverProps,
} from "react-aria-components";
import { useFocusVisible } from "react-aria";
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
import { SelectSlotProvider } from "./Select";

export interface ComboBoxProps<T extends object>
  extends Omit<RACComboBoxProps<T>, "className" | "children" | "style">,
    SelectVariantProps,
    FieldSupportProps,
    FieldLayoutProps {
  /** Visible label. Use `aria-label` instead where the design has none. */
  label?: ReactNode;
  /** Label style overrides. */
  labelCss?: SystemStyleObject;
  placeholder?: string;
  /**
   * Rendered inside the control, before the input — an icon for the current
   * value, say. A ComboBox's control is a text input, so unlike a Select it
   * cannot show anything but text for what is chosen; this is the way round
   * that (react-select did it with a custom `SingleValue`).
   */
  startContent?: ReactNode;
  /**
   * `SelectOption`s, or a render function over the `items` prop for a
   * dynamic collection — which is how an async lookup works: drive `items`
   * from loaded results (e.g. react-stately's useAsyncList) and filter
   * server-side; react-aria skips its own text filtering when `items` is
   * controlled. Pair with `emptyState` (swap its content while loading) and
   * `isPopoverHidden` for a minimum query length.
   */
  children: ReactNode | ((item: T) => ReactNode);
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
  /**
   * Cap the dropdown's height (react-select's `maxMenuHeight`). A prop rather
   * than a `contentCss` rule because RAC writes its own max-height inline
   * while positioning, which beats any class.
   */
  maxHeight?: number;
  /**
   * Per-instance overrides for the trigger — the box around the input, its
   * `startContent` and its indicator, the same slot `Select`'s `triggerCss`
   * styles. Reach the input itself through the `select` recipe's `value`
   * slot.
   */
  triggerCss?: SystemStyleObject;
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
    labelCss,
    placeholder,
    startContent,
    children,
    indicator,
    emptyState,
    isPopoverHidden,
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
  }: ComboBoxProps<T>,
  ref: ForwardedRef<HTMLInputElement>,
) => {
  // As Select: forward whatever variant groups the merged recipe has.
  const [variantProps, rest] = select.splitVariantProps(props);
  const intl = useIntl();
  const slots = select(variantProps);
  const fieldSlots = field({ size: variantProps.size, labelPosition });
  // Anchor the card to the whole control, not to the bare input inside it —
  // otherwise it hangs off the text baseline and is as narrow as the input.
  // Global interaction modality, with the text-input key filter (only
  // Tab/Escape count while typing). This is the half of "keyboard focus"
  // that SURVIVES the synthetic blur react-aria dispatches at the input
  // while virtual focus is on an option — the input's own data attributes
  // don't (see the select recipe's ring rule). Paired there with native
  // :has(input:focus), which also survives, the trigger's ring is
  // keyboard-only without flickering during list navigation.
  const { isFocusVisible } = useFocusVisible({ isTextInput: true });
  const triggerRef = useRef<HTMLDivElement>(null);
  // RAC's --trigger-width measures the input it anchors a ComboBox to, which
  // is the control's content box — so a card sized from it is narrower than
  // the field by the padding and border. Measure the control instead. State
  // rather than reading the ref at render time: the popover is mounted from
  // the first render, before the ref is set, and nothing would re-render it.
  const [triggerWidth, setTriggerWidth] = useState<number>();
  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) {
      return;
    }
    const update = () => setTriggerWidth(el.offsetWidth);
    update();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <SelectSlotProvider value={slots}>
      <RACComboBox
        allowsEmptyCollection={emptyState != null}
        {...(rest as RACComboBoxProps<T>)}
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
        <div
          ref={triggerRef}
          data-keyboard-modality={isFocusVisible || undefined}
          className={cx(
            slots.trigger,
            triggerCss ? css(triggerCss) : undefined,
          )}
        >
          {startContent}
          <RACInput
            ref={ref}
            placeholder={placeholder}
            className={slots.value}
          />
          {indicator !== null && (
            <RACButton
              aria-label={intl.formatMessage(uiMessage("ui.combobox-trigger"))}
              className={slots.indicator}
            >
              {indicator ?? <Icon as={RiArrowDownSLine} />}
            </RACButton>
          )}
        </div>
        {!isPopoverHidden && (
          <Popover
            triggerRef={triggerRef}
            placement={placement}
            maxHeight={maxHeight}
            style={triggerWidth ? { width: triggerWidth } : undefined}
            className={cx(
              slots.content,
              contentCss ? css(contentCss) : undefined,
            )}
          >
            <RACListBox
              aria-label={intl.formatMessage(uiMessage("ui.combobox-listbox"))}
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
        <FieldSupport
          helperText={helperText}
          errorMessage={errorMessage}
          helperTextCss={helperTextCss}
          labelPosition={labelPosition}
        />
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
