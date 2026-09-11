/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonGroup, Icon, IconButton } from "@microbit/ui";
import {
  RiCloseLine,
  RiDeleteBin2Line,
  RiEdit2Line,
  RiFileCopyLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { uiPatternsMessage } from "../messages";

export interface ProjectsToolbarProps {
  /** How many projects are selected. Rename and duplicate need exactly one. */
  selectedCount: number;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  /** Icons without labels, for narrow layouts. */
  iconOnly?: boolean;
  /**
   * Attached: a squared strip with hairline dividers (the default). The
   * shared group's pill-with-gap does not suit ghost buttons, which have no
   * fill for a gap to separate.
   */
  isAttached?: boolean;
  size?: "md" | "lg";
  className?: string;
}

/**
 * Actions on the selected projects: rename and duplicate when one is
 * selected, delete and clear always.
 */
export const ProjectsToolbar = ({
  selectedCount,
  onRename,
  onDuplicate,
  onDelete,
  onClearSelection,
  iconOnly,
  isAttached = true,
  size,
  className,
}: ProjectsToolbarProps) => {
  const intl = useIntl();
  const isSingle = selectedCount === 1;
  const iconCss = { fontSize: "xl" } as const;
  return (
    <ButtonGroup
      isAttached={isAttached}
      role="group"
      aria-label={intl.formatMessage(
        uiPatternsMessage("ui-patterns.selection-actions-group"),
      )}
      className={className}
      css={
        isAttached
          ? {
              "& > button": { borderRadius: 0 },
              "& > button + button": {
                borderLeft: "1px solid",
                borderColor: "gray.200",
              },
            }
          : undefined
      }
    >
      {isSingle &&
        (iconOnly ? (
          <IconButton
            variant="ghost"
            size={size}
            onPress={() => onRename()}
            css={iconCss}
            aria-label={intl.formatMessage(
              uiPatternsMessage("ui-patterns.rename-project-action"),
            )}
          >
            <Icon as={RiEdit2Line} />
          </IconButton>
        ) : (
          <Button
            variant="ghost"
            size={size}
            onPress={() => onRename()}
            startIcon={<Icon as={RiEdit2Line} />}
          >
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.rename-project-action")}
            />
          </Button>
        ))}
      {isSingle &&
        (iconOnly ? (
          <IconButton
            variant="ghost"
            size={size}
            onPress={() => onDuplicate()}
            css={iconCss}
            aria-label={intl.formatMessage(
              uiPatternsMessage("ui-patterns.duplicate-project-action"),
            )}
          >
            <Icon as={RiFileCopyLine} />
          </IconButton>
        ) : (
          <Button
            variant="ghost"
            size={size}
            onPress={() => onDuplicate()}
            startIcon={<Icon as={RiFileCopyLine} />}
          >
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.duplicate-project-action")}
            />
          </Button>
        ))}
      {iconOnly && isSingle ? (
        <IconButton
          variant="ghost"
          size={size}
          onPress={() => onDelete()}
          css={iconCss}
          aria-label={intl.formatMessage(
            uiPatternsMessage("ui-patterns.delete-project-action"),
            { count: selectedCount },
          )}
        >
          <Icon as={RiDeleteBin2Line} />
        </IconButton>
      ) : (
        <Button
          variant="ghost"
          size={size}
          onPress={() => onDelete()}
          startIcon={<Icon as={RiDeleteBin2Line} />}
        >
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.delete-project-action")}
            values={{ count: selectedCount }}
          />
        </Button>
      )}
      {iconOnly ? (
        <IconButton
          variant="ghost"
          size={size}
          onPress={() => onClearSelection()}
          css={iconCss}
          aria-label={intl.formatMessage(
            uiPatternsMessage("ui-patterns.clear-action"),
          )}
        >
          <Icon as={RiCloseLine} />
        </IconButton>
      ) : (
        <Button
          variant="ghost"
          size={size}
          onPress={() => onClearSelection()}
          startIcon={<Icon as={RiCloseLine} />}
        >
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.clear-action")}
          />
        </Button>
      )}
    </ButtonGroup>
  );
};
