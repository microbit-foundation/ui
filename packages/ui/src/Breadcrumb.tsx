/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext } from "react";
import { useIntl } from "react-intl";
import { css, cx } from "styled-system/css";
import { styled, type HTMLStyledProps } from "styled-system/jsx";
import { breadcrumb } from "styled-system/recipes";
import { SystemStyleObject } from "styled-system/types";
import { Link } from "./Link";
import { uiMessage } from "./messages";

// The separator is declared once on the Breadcrumb and rendered by every
// item; the current-page flag hops from BreadcrumbItem to the BreadcrumbLink
// inside it.
const SeparatorContext = createContext<ReactNode>("/");
const CurrentPageContext = createContext(false);

export interface BreadcrumbProps {
  /** Between items; an element or string. Default "/". */
  separator?: ReactNode;
  /** Per-instance style overrides for the nav (e.g. fontSize). */
  css?: SystemStyleObject;
  className?: string;
  /** BreadcrumbItems. */
  children: ReactNode;
}

/**
 * Breadcrumb — a navigation trail: nav > ol > li with a separator between
 * items and the current page as plain text with `aria-current="page"`.
 */
export const Breadcrumb = ({
  separator = "/",
  css: cssProp,
  className,
  children,
}: BreadcrumbProps) => {
  const intl = useIntl();
  const slots = breadcrumb();
  return (
    <nav
      aria-label={intl.formatMessage(uiMessage("ui.breadcrumb"))}
      className={cx(slots.root, cssProp ? css(cssProp) : undefined, className)}
    >
      <SeparatorContext.Provider value={separator}>
        <ol className={slots.list}>{children}</ol>
      </SeparatorContext.Provider>
    </nav>
  );
};

export interface BreadcrumbItemProps {
  /**
   * Marks this item as the current page: its BreadcrumbLink renders as a
   * plain span with `aria-current="page"` rather than a link.
   */
  isCurrentPage?: boolean;
  css?: SystemStyleObject;
  className?: string;
  children: ReactNode;
}

export const BreadcrumbItem = ({
  isCurrentPage = false,
  css: cssProp,
  className,
  children,
}: BreadcrumbItemProps) => {
  const separator = useContext(SeparatorContext);
  const slots = breadcrumb();
  return (
    <li
      className={cx(slots.item, cssProp ? css(cssProp) : undefined, className)}
    >
      <CurrentPageContext.Provider value={isCurrentPage}>
        {children}
      </CurrentPageContext.Provider>
      <span
        data-separator
        role="presentation"
        aria-hidden
        className={slots.separator}
      >
        {separator}
      </span>
    </li>
  );
};

export type BreadcrumbLinkProps = HTMLStyledProps<"a">;

// The current page's text: same element shape as the link (so call-site
// style props keep working) minus the interactivity.
const CurrentPageText = styled("span");

/**
 * The trail's link: the shared `Link`, or a plain span with
 * `aria-current="page"` inside an item marked `isCurrentPage`.
 */
export const BreadcrumbLink = (props: BreadcrumbLinkProps) => {
  const isCurrentPage = useContext(CurrentPageContext);
  if (isCurrentPage) {
    const { href: _href, children, ...rest } = props;
    return (
      <CurrentPageText aria-current="page" {...rest}>
        {children}
      </CurrentPageText>
    );
  }
  // The trail is navigation, so the prose underline stays off by default.
  return <Link variant="standalone" {...props} />;
};
