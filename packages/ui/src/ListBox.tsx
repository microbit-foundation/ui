/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ListBox as RACListBox,
  ListBoxItem as RACListBoxItem,
  ListBoxItemProps as RACListBoxItemProps,
  ListBoxProps as RACListBoxProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { listBox } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

export interface ListBoxProps<T extends object>
  extends Omit<RACListBoxProps<T>, "className" | "style" | "children"> {
  /** `ListBoxOption`s, or a render function when `items` is given. */
  children: RACListBoxProps<T>["children"];
  /** Per-instance style overrides for the list, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * ListBox — react-aria-components' <ListBox>, standing on the page rather
 * than inside a dropdown (that is `Select`/`ComboBox`, which share their own
 * recipe).
 *
 * Options are leaves: a button inside one is unreachable by keyboard, so rows
 * carrying their own controls want `GridList`.
 */
export const ListBox = <T extends object>({
  css: cssProp,
  className,
  children,
  ...rest
}: ListBoxProps<T>) => {
  const slots = listBox();
  return (
    <RACListBox
      {...rest}
      className={cx(slots.root, cssProp ? css(cssProp) : undefined, className)}
    >
      {children}
    </RACListBox>
  );
};

export interface ListBoxOptionProps<T extends object = object>
  extends Omit<RACListBoxItemProps<T>, "className" | "style" | "children"> {
  /**
   * The option's content. A function receives the option's state, for a row
   * that draws its own selected marker rather than taking the recipe's
   * background.
   */
  children?: RACListBoxItemProps<T>["children"];
  /** Per-instance style overrides for the option, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * An option in a `ListBox`.
 *
 * Give it a `textValue` where its children aren't a plain string: react-aria
 * derives typeahead text from string children only.
 */
export const ListBoxOption = <T extends object = object>({
  css: cssProp,
  className,
  children,
  ...rest
}: ListBoxOptionProps<T>) => {
  const slots = listBox();
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
