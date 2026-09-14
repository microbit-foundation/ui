/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonGroup, Icon, IconButton } from "@microbit/ui";
import { forwardRef, useImperativeHandle, useRef } from "react";
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
  /**
   * Icons without labels, for narrow layouts. Delete keeps its label when
   * more than one project is selected so the count is visible.
   */
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

export interface ProjectsToolbarHandle {
  /**
   * Moves focus to the first button, for a card's "skip to toolbar". Returns
   * false when the toolbar is hidden (a page that renders one toolbar for
   * wide layouts and another for narrow can try each in turn).
   */
  focus: () => boolean;
}

/**
 * Actions on the selected projects: rename and duplicate when one is
 * selected, delete and clear always.
 */
export const ProjectsToolbar = forwardRef<
  ProjectsToolbarHandle,
  ProjectsToolbarProps
>(function ProjectsToolbar(
  {
    selectedCount,
    onRename,
    onDuplicate,
    onDelete,
    onClearSelection,
    iconOnly,
    isAttached = true,
    size,
    className,
  },
  ref,
) {
  const intl = useIntl();
  const groupRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        const group = groupRef.current;
        if (!group || !(group.checkVisibility?.() ?? true)) {
          return false;
        }
        const button = group.querySelector<HTMLElement>("button");
        button?.focus();
        return button !== null;
      },
    }),
    [],
  );
  const isSingle = selectedCount === 1;
  const iconCss = { fontSize: "xl" } as const;
  return (
    <ButtonGroup
      ref={groupRef}
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
                borderInlineStart: "1px solid",
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
});
