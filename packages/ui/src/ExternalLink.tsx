/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ComponentProps } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { Icon } from "./Icon";
import { Link } from "./Link";
import { uiMessage } from "./messages";
import { VisuallyHidden } from "./VisuallyHidden";

export type ExternalLinkProps = Omit<
  ComponentProps<typeof Link>,
  "target" | "rel"
>;

/**
 * ExternalLink — a Link that opens in a new tab and says so both ways: a
 * trailing external-link glyph for sighted users, and a visually hidden,
 * translated "opens in a new tab" for assistive tech. Use this rather than
 * restating `target="_blank"` + icon so the announcement can't be forgotten.
 *
 * For app chrome, where a new tab protects the user's session-only state.
 * Content surfaces should prefer same-tab links, or a visible
 * "(opens in new tab)" suffix and no icon.
 *
 * Inline-safe: the icon is 1em and follows the text colour, so the link can
 * sit in prose as well as stand alone.
 */
export const ExternalLink = ({ children, ...props }: ExternalLinkProps) => (
  <Link {...props} target="_blank" rel="noopener">
    {children}
    <VisuallyHidden>
      {/* The comma separates the suffix in the accessible name: inline nodes
          concatenate without a space, and leading whitespace is trimmed. */}
      {", "}
      <FormattedMessage {...uiMessage("ui.new-tab-notice")} />
    </VisuallyHidden>
    <Icon as={RiExternalLinkLine} aria-hidden css={{ ml: 1 }} />
  </Link>
);
