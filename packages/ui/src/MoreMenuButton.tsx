/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { forwardRef } from "react";
import { MdMoreVert } from "react-icons/md";
import { Icon } from "./Icon";
import { IconButton, IconButtonProps } from "./IconButton";

export interface MoreMenuButtonProps
  extends Omit<IconButtonProps, "children"> {}

/**
 * MoreMenuButton — the "more options" half of a split button. Use as the
 * trigger inside a MenuTrigger, alongside the main action, both in an
 * attached ButtonGroup:
 *
 * ```tsx
 * <ButtonGroup isAttached>
 *   <Button variant="primary" onPress={send}>Send</Button>
 *   <MenuTrigger>
 *     <MoreMenuButton variant="primary" aria-label="More send options" />
 *     <MenuList>…</MenuList>
 *   </MenuTrigger>
 * </ButtonGroup>
 * ```
 *
 * Give it the main action's `variant`, `tone` and `size`: the two halves are
 * one control. The seam between them is ButtonGroup's job.
 */
export const MoreMenuButton = forwardRef<
  HTMLButtonElement,
  MoreMenuButtonProps
>(function MoreMenuButton({ css: cssProp, ...props }, ref) {
  return (
    <IconButton ref={ref} css={cssProp} {...props}>
      <Icon
        as={MdMoreVert}
        css={{
          // Optical centring: an attached end button is a rectangle plus a
          // semicircle, whose area sits 4.7% of the width towards the flat
          // edge. A share of the width rather than a length because that is a
          // property of the shape, not the size — the button stays square and
          // the radius always clamps to half its height (see IconButton), so
          // one percentage holds everywhere. Leading is the mirror image; a
          // middle or lone button is symmetric and needs nothing.
          //
          // Position rather than margin so the nudge can't feed back into the
          // width the percentage resolves against.
          "[data-attached] > *:not(:first-child):last-child &": {
            position: "relative",
            insetInlineStart: "-4.7%",
          },
          "[data-attached] > *:first-child:not(:last-child) &": {
            position: "relative",
            insetInlineStart: "4.7%",
          },
        }}
      />
    </IconButton>
  );
});
