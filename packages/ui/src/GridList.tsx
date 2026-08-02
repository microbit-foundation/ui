/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  GridList as RACGridList,
  GridListItem as RACGridListItem,
  GridListItemProps as RACGridListItemProps,
  GridListProps as RACGridListProps,
} from "react-aria-components";
import { css, cx } from "styled-system/css";
import { gridList } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";

export interface GridListProps<T extends object>
  extends Omit<RACGridListProps<T>, "className" | "style" | "children"> {
  /** `GridListItem`s, or a render function when `items` is given. */
  children: RACGridListProps<T>["children"];
  /** Per-instance style overrides for the list, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * GridList — react-aria-components' <GridList>: a list of selectable rows,
 * each of which may contain its own buttons and menus.
 *
 * Reach for it over a `ListBox` when the rows carry controls: a listbox option
 * is a leaf, so a button inside one is unreachable by keyboard, where a grid
 * row's contents are part of the grid's navigation.
 */
export const GridList = <T extends object>({
  css: cssProp,
  className,
  children,
  ...rest
}: GridListProps<T>) => {
  const slots = gridList();
  return (
    <RACGridList
      {...rest}
      className={cx(slots.root, cssProp ? css(cssProp) : undefined, className)}
    >
      {children}
    </RACGridList>
  );
};

export interface GridListItemProps<T extends object = object>
  extends Omit<RACGridListItemProps<T>, "className" | "style" | "children"> {
  children?: ReactNode;
  /** Per-instance style overrides for the row, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * A row in a `GridList`. Its children are laid out by the row itself — the
 * gridcell react-aria puts between them is `display: contents`.
 *
 * Give every row a `textValue`: react-aria derives typeahead text from string
 * children only, and a row is usually a composition rather than a string.
 */
export const GridListItem = <T extends object = object>({
  css: cssProp,
  className,
  children,
  ...rest
}: GridListItemProps<T>) => {
  const slots = gridList();
  return (
    <RACGridListItem
      {...rest}
      className={cx(slots.item, cssProp ? css(cssProp) : undefined, className)}
    >
      {children}
    </RACGridListItem>
  );
};
