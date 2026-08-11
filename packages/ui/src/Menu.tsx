/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, useCallback, useState } from "react";
import {
  Header as RACHeader,
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  MenuItemProps as RACMenuItemProps,
  MenuSection as RACMenuSection,
  MenuTrigger as RACMenuTrigger,
  Popover,
  PopoverProps,
  Separator,
} from "react-aria-components";
import { RiCheckLine } from "react-icons/ri";
import { css, cx } from "styled-system/css";
import { menu } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { Icon } from "./Icon";
import { useOverlayCloseRegistrar } from "./SharedUIProvider";

export interface MenuTriggerProps {
  /** Called when the menu opens. */
  onOpen?: () => void;
  /** Called when the menu closes. */
  onClose?: () => void;
  /** The trigger element followed by a `MenuList` (react-aria pattern). */
  children: ReactNode;
}

/**
 * MenuTrigger — react-aria-components' <MenuTrigger>. Its first child is the
 * trigger (e.g. a Button); the second is a `MenuList`. RAC returns focus to the
 * trigger when the menu closes.
 *
 * When the app installs an overlay-close registrar (e.g. so the Android back
 * button can close the menu), the trigger runs controlled and registers its
 * close function while open. Otherwise it's an uncontrolled pass-through.
 */
export const MenuTrigger = ({
  onOpen,
  onClose,
  children,
}: MenuTriggerProps) => {
  const registerClose = useOverlayCloseRegistrar();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        registerClose?.(() => {
          setIsOpen(false);
          registerClose(null);
        });
        onOpen?.();
      } else {
        registerClose?.(null);
        onClose?.();
      }
    },
    [registerClose, onOpen, onClose],
  );

  if (!registerClose) {
    return (
      <RACMenuTrigger
        onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}
      >
        {children}
      </RACMenuTrigger>
    );
  }

  return (
    <RACMenuTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {children}
    </RACMenuTrigger>
  );
};

export interface MenuListProps {
  children: ReactNode;
  /** Placement of the dropdown relative to the trigger. */
  placement?: PopoverProps["placement"];
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * MenuList — the dropdown surface: RAC's <Popover> (positioned card) wrapping a
 * RAC <Menu> (the list). Place `MenuItem`s inside.
 */
export const MenuList = ({
  children,
  placement = "bottom start",
  css: cssProp,
  className,
}: MenuListProps) => {
  const slots = menu();
  return (
    <Popover
      placement={placement}
      className={cx(
        slots.content,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
    >
      <RACMenu className={slots.list}>{children}</RACMenu>
    </Popover>
  );
};

export interface MenuItemProps
  extends Omit<RACMenuItemProps, "className" | "children"> {
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
  children?: ReactNode;
}

/**
 * MenuItem — a RAC <MenuItem> styled with the `menu` recipe's `item` slot.
 * Use `onAction` for the click behaviour (RAC closes the menu automatically).
 */
export const MenuItem = ({
  icon,
  css: cssProp,
  className,
  children,
  ...rest
}: MenuItemProps) => {
  const slots = menu();
  return (
    <RACMenuItem
      className={cx(slots.item, cssProp ? css(cssProp) : undefined, className)}
      {...rest}
    >
      {icon ? (
        <>
          <span className={slots.icon}>{icon}</span>
          <span className={slots.label}>{children}</span>
        </>
      ) : (
        children
      )}
    </RACMenuItem>
  );
};

interface MenuOptionGroupBaseProps {
  /** Group heading shown above the options. */
  title?: ReactNode;
  /** `MenuItemOption` children. */
  children: ReactNode;
  css?: SystemStyleObject;
  className?: string;
}

export interface MenuOptionGroupRadioProps extends MenuOptionGroupBaseProps {
  type?: "radio";
  /** The selected `MenuItemOption`'s value. */
  value?: string;
  /** Called with the newly selected option's value. */
  onChange?: (value: string) => void;
}

export interface MenuOptionGroupCheckboxProps extends MenuOptionGroupBaseProps {
  type: "checkbox";
  /** The checked `MenuItemOption`s' values. */
  value?: string[];
  /** Called with the full set of checked values after a toggle. */
  onChange?: (value: string[]) => void;
}

export type MenuOptionGroupProps =
  | MenuOptionGroupRadioProps
  | MenuOptionGroupCheckboxProps;

/**
 * MenuOptionGroup — a group of checkable `MenuItemOption`s within a menu.
 * `type="radio"` (the default) is single-select and renders `menuitemradio`;
 * `type="checkbox"` is multi-select and renders `menuitemcheckbox`, each
 * option toggling independently.
 *
 * Selection is section-scoped (RAC MenuSection), so a menu can mix action items
 * and option groups. An option's own `onAction` still fires on every press,
 * including the press that deselects it — so a lone toggle can be driven either
 * by the group's `onChange` or by the item's `onAction`.
 *
 * Choosing an option leaves the menu open (a plain `MenuItem` closes it).
 */
export const MenuOptionGroup = (props: MenuOptionGroupProps) => {
  const { title, children, css: cssProp, className } = props;
  const slots = menu();
  const selectedKeys =
    props.type === "checkbox"
      ? props.value ?? []
      : props.value != null
        ? [props.value]
        : [];
  return (
    <RACMenuSection
      className={cx(slots.group, cssProp ? css(cssProp) : undefined, className)}
      selectionMode={props.type === "checkbox" ? "multiple" : "single"}
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        if (keys === "all") {
          return;
        }
        const values = [...keys].map(String);
        if (props.type === "checkbox") {
          props.onChange?.(values);
        } else if (values.length > 0) {
          // Radio: a press that clears the selection reports nothing.
          props.onChange?.(values[0]);
        }
      }}
    >
      {title != null && (
        <RACHeader className={slots.groupTitle}>{title}</RACHeader>
      )}
      {children}
    </RACMenuSection>
  );
};

export interface MenuItemOptionProps
  extends Omit<RACMenuItemProps, "className" | "children" | "id" | "value"> {
  /** This option's value within its `MenuOptionGroup`. */
  value: string;
  css?: SystemStyleObject;
  className?: string;
  children?: ReactNode;
}

/**
 * MenuItemOption — a selectable option inside a `MenuOptionGroup`, with a
 * check indicator on the selected item.
 */
export const MenuItemOption = ({
  value,
  css: cssProp,
  className,
  children,
  ...rest
}: MenuItemOptionProps) => {
  const slots = menu();
  return (
    <RACMenuItem
      id={value}
      className={cx(slots.item, cssProp ? css(cssProp) : undefined, className)}
      {...rest}
    >
      <span className={slots.itemIndicator} aria-hidden>
        <Icon as={RiCheckLine} />
      </span>
      <span className={slots.label}>{children}</span>
    </RACMenuItem>
  );
};

export interface MenuDividerProps {
  css?: SystemStyleObject;
  className?: string;
}

/** Horizontal rule separating groups of menu items. */
export const MenuDivider = ({ css: cssProp, className }: MenuDividerProps) => {
  const slots = menu();
  return (
    <Separator
      className={cx(
        slots.divider,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
    />
  );
};
