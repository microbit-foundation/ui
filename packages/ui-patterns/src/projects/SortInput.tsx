/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, Icon, IconButton, NativeSelect } from "@microbit/ui";
import { RiArrowDownLine, RiArrowUpLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { uiPatternsMessage } from "../messages";
import { ProjectSortField, SortDirection } from "./types";

export interface SortInputProps {
  field: ProjectSortField;
  onFieldChange: (field: ProjectSortField) => void;
  direction: SortDirection;
  onToggleDirection: () => void;
  /**
   * While searching, results are ranked by relevance and the controls are
   * disabled, showing "Relevance" in place of the field.
   */
  hasSearchQuery: boolean;
  className?: string;
}

/**
 * Sort field select with an attached direction button.
 */
export const SortInput = ({
  field,
  onFieldChange,
  direction,
  onToggleDirection,
  hasSearchQuery,
  className,
}: SortInputProps) => {
  const intl = useIntl();
  const message = (id: Parameters<typeof uiPatternsMessage>[0]) =>
    intl.formatMessage(uiPatternsMessage(id));
  const descending = hasSearchQuery || direction === "desc";
  return (
    <ButtonGroup isAttached css={{ minW: 0 }} className={className}>
      <NativeSelect
        value={hasSearchQuery ? "relevance" : field}
        onChange={(e) => onFieldChange(e.target.value as ProjectSortField)}
        aria-label={message("ui-patterns.sort-projects-label")}
        // The adjacent direction button keeps the control from reading as a
        // plain text field.
        hideChevron
        disabled={hasSearchQuery}
        // Lets the select shrink below its longest option when space is
        // tight, clipping the text.
        css={{ fontSize: "lg", background: "white", flex: 1, minW: 0 }}
      >
        {hasSearchQuery ? (
          <option value="relevance">
            {message("ui-patterns.sort-option-relevance")}
          </option>
        ) : (
          <>
            <option value="name">
              {message("ui-patterns.sort-option-name")}
            </option>
            <option value="timestamp">
              {message("ui-patterns.sort-option-last-modified")}
            </option>
          </>
        )}
      </NativeSelect>
      <IconButton
        variant="ghost"
        aria-label={message(
          descending
            ? "ui-patterns.sort-order-descending-label"
            : "ui-patterns.sort-order-ascending-label",
        )}
        onPress={onToggleDirection}
        isDisabled={hasSearchQuery}
        css={{
          background: "white",
          fontSize: "2xl",
          // Poses as the second half of the attached select, so the border
          // tracks the input recipe's resting border; the divider between
          // the two is ButtonGroup's hairline.
          border: "2px solid",
          borderColor: "gray.300",
          _hover: { borderColor: "gray.500" },
          color: "gray.500",
          borderRadius: "md",
        }}
      >
        <Icon as={descending ? RiArrowDownLine : RiArrowUpLine} />
      </IconButton>
    </ButtonGroup>
  );
};
