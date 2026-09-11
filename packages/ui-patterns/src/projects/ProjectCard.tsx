/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  HStack,
  Icon,
  IconButton,
  LinkBox,
  LinkOverlayButton,
  MenuItem,
  MenuList,
  MenuTrigger,
  Stack,
  SystemStyleObject,
  Text,
  VisuallyHidden,
} from "@microbit/ui";
import { ReactNode, RefObject, useCallback, useRef } from "react";
import { MdMoreVert } from "react-icons/md";
import {
  RiDeleteBin2Line,
  RiEdit2Line,
  RiFileCopyLine,
  RiFolderOpenLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { uiPatternsMessage } from "../messages";
import { formatTimeAgo } from "./time-ago";
import { ProjectNameDialogReason, ProjectSummary } from "./types";

export interface ProjectCardProps {
  project: ProjectSummary;
  /**
   * The app's picture of the project (a logo, a glyph, a preview), placed
   * between the actions row and the name.
   */
  children?: ReactNode;
  /** One line under the name, e.g. what the project contains. */
  description?: ReactNode;
  /** When set the card shows a selection checkbox. */
  isSelected?: boolean;
  onSelected?: (id: string) => void;
  /**
   * When set, a selected card carries a hidden "skip to toolbar" button for
   * keyboard users, so they need not tab through every card to act on a
   * selection.
   */
  onSkipToToolbar?: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onRenameDuplicate: (reason: ProjectNameDialogReason, id: string) => void;
  /**
   * Called with the menu button before a menu action opens a dialog, so the
   * dialog can return focus to it. See useProjectActions.
   */
  setFinalFocusRef?: (ref: RefObject<HTMLElement>) => void;
  /** Per-instance overrides for the card body, e.g. tighter padding. */
  bodyCss?: SystemStyleObject;
  className?: string;
}

/**
 * A project in a grid or carousel: actions row (optional checkbox, more
 * menu), the app's content, then the name as the card's link and when it was
 * last modified.
 */
export const ProjectCard = ({
  project,
  children,
  description,
  isSelected,
  onSelected,
  onSkipToToolbar,
  onOpen,
  onDelete,
  onRenameDuplicate,
  setFinalFocusRef,
  bodyCss,
  className,
}: ProjectCardProps) => {
  const intl = useIntl();
  const { id, name, timestamp } = project;
  const handleOpen = useCallback(() => onOpen(id), [id, onOpen]);
  return (
    <LinkBox h="100%" w="100%" className={className}>
      <Card css={{ h: "100%", w: "100%" }}>
        <CardBody css={{ display: "flex", ...bodyCss }}>
          <Stack h="100%" w="100%" gap={0}>
            <ProjectCardActions
              id={id}
              name={name}
              isSelected={isSelected}
              onSelected={onSelected}
              onSkipToToolbar={onSkipToToolbar}
              onOpen={onOpen}
              onDelete={onDelete}
              onRenameDuplicate={onRenameDuplicate}
              setFinalFocusRef={setFinalFocusRef}
            />
            {children}
            <LinkOverlayButton
              onClick={handleOpen}
              css={{
                mt: "auto",
                h: 8,
                textAlign: "left",
                fontSize: "xl",
                truncate: true,
              }}
            >
              {name}
            </LinkOverlayButton>
            {description !== undefined && (
              <Text lineClamp={1} h="1lh">
                {description}
              </Text>
            )}
            <Text fontSize="sm" pt={2} color="blackAlpha.700">
              {formatTimeAgo(intl, timestamp)}
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </LinkBox>
  );
};

interface ProjectCardActionsProps {
  id: string;
  name: string;
  isSelected?: boolean;
  onSelected?: (id: string) => void;
  onSkipToToolbar?: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onRenameDuplicate: (reason: ProjectNameDialogReason, id: string) => void;
  setFinalFocusRef?: (ref: RefObject<HTMLElement>) => void;
}

const ProjectCardActions = ({
  id,
  name,
  isSelected,
  onSelected,
  onSkipToToolbar,
  onOpen,
  onDelete,
  onRenameDuplicate,
  setFinalFocusRef,
}: ProjectCardActionsProps) => {
  const intl = useIntl();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const withFocusReturn = useCallback(
    (action: () => void) => () => {
      setFinalFocusRef?.(menuButtonRef);
      action();
    },
    [setFinalFocusRef],
  );
  return (
    <HStack
      justifyContent="space-between"
      position="absolute"
      w="100%"
      top={0}
      left={0}
    >
      {onSelected && (
        <Checkbox
          isSelected={isSelected ?? false}
          onChange={() => onSelected(id)}
          css={{
            px: 5,
            py: 5,
            color: "brand.600",
            zIndex: 1,
            borderColor: "gray.500",
            _hover: { backgroundColor: "blackAlpha.50" },
            borderBottomRightRadius: "md",
            h: "60px",
          }}
        >
          <VisuallyHidden>
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.select-project-action")}
              values={{ name }}
            />
          </VisuallyHidden>
        </Checkbox>
      )}
      {onSkipToToolbar && (
        <Button
          excludeFromTabOrder={!isSelected}
          onPress={onSkipToToolbar}
          size="xs"
          variant="primary"
          css={{
            zIndex: 3,
            position: "absolute",
            left: "50%",
            top: 1,
            transform: "translateX(-50%)",
            opacity: 0,
            pointerEvents: "none",
            _focusVisible: { opacity: 1, pointerEvents: "auto" },
          }}
        >
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.skip-to-toolbar-action")}
          />
        </Button>
      )}
      <MenuTrigger>
        <IconButton
          ref={menuButtonRef}
          aria-label={intl.formatMessage(
            uiPatternsMessage("ui-patterns.project-menu-label"),
            { name },
          )}
          variant="ghost"
          css={{
            zIndex: 1,
            px: 5,
            py: 5,
            h: "100%",
            borderRadius: 0,
            borderBottomLeftRadius: "md",
            fontSize: "xl",
            ml: "auto",
          }}
        >
          <Icon as={MdMoreVert} />
        </IconButton>
        <MenuList>
          <MenuItem
            icon={<Icon as={RiFolderOpenLine} />}
            onAction={() => onOpen(id)}
            textValue={intl.formatMessage(
              uiPatternsMessage("ui-patterns.open-project-action"),
            )}
          >
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.open-project-action")}
            />
          </MenuItem>
          <MenuItem
            icon={<Icon as={RiEdit2Line} />}
            onAction={withFocusReturn(() => onRenameDuplicate("rename", id))}
            textValue={intl.formatMessage(
              uiPatternsMessage("ui-patterns.rename-project-action"),
            )}
          >
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.rename-project-action")}
            />
          </MenuItem>
          <MenuItem
            icon={<Icon as={RiFileCopyLine} />}
            onAction={withFocusReturn(() => onRenameDuplicate("duplicate", id))}
            textValue={intl.formatMessage(
              uiPatternsMessage("ui-patterns.duplicate-project-action"),
            )}
          >
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.duplicate-project-action")}
            />
          </MenuItem>
          <MenuItem
            icon={<Icon as={RiDeleteBin2Line} />}
            onAction={withFocusReturn(() => onDelete(id))}
            textValue={intl.formatMessage(
              uiPatternsMessage("ui-patterns.delete-project-action"),
              { count: 1 },
            )}
          >
            <FormattedMessage
              {...uiPatternsMessage("ui-patterns.delete-project-action")}
              values={{ count: 1 }}
            />
          </MenuItem>
        </MenuList>
      </MenuTrigger>
    </HStack>
  );
};
