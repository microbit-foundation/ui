/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  ExternalLink,
  Flex,
  Grid,
  HStack,
  Icon,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Text,
  TooltipButton,
  useToast,
  VStack,
} from "@microbit/ui";
import { uiMessage } from "@microbit/ui/messages";
import { ReactNode, RefObject, useCallback, useId } from "react";
import {
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { KnownLanguageId, languageFromId, languageOrder } from "./languages";
import { uiPatternsMessage } from "./messages";

export interface LanguageDialogSupportItem {
  /** Product name as displayed, e.g. "Microsoft MakeCode" or the app name. */
  name: string;
  supported: boolean;
}

export interface LanguageDialogLanguage {
  id: KnownLanguageId;
  /**
   * Per-product translation coverage. A language with any unsupported
   * product is listed under a "Partially supported" heading, with a warning
   * tooltip and a post-selection toast showing this checklist. Omit for
   * apps without the support-tier concept (a flat grid), or pass it for
   * every language and let the dialog derive the sections.
   */
  support?: LanguageDialogSupportItem[];
  /**
   * Marks an early-preview translation: the English name gains an asterisk
   * and the dialog a footnote.
   */
  preview?: boolean;
  /**
   * Display-name overrides, pending the family-wide en/en-US naming
   * decision — ml-trainer passes `name: "English (UK)"` for `en` because it
   * also offers `en-US`. Prefer the registry names otherwise.
   */
  name?: string;
  enName?: string;
}

const isPartiallySupported = (language: LanguageDialogLanguage): boolean =>
  language.support?.some((item) => !item.supported) ?? false;

export interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to, typically the settings menu button. */
  finalFocusRef?: RefObject<HTMLElement>;
  /** Languages to offer, in any order; the dialog sorts by registry order. */
  languages: LanguageDialogLanguage[];
  /**
   * Applies the selection (store/settings write, editor reload, etc.). The
   * dialog closes once the returned promise settles.
   */
  onSelectLanguage: (languageId: KnownLanguageId) => void | Promise<void>;
  /** When given, a "Help translate" external link appears in the footer. */
  translationLinkHref?: string;
}

/**
 * Language settings dialog — a grid of language cards (endonym over English
 * name), split into fully/partially supported sections when any language's
 * support checklist has an unsupported product. Selection applies
 * immediately: no confirm step, no page reload expected. Endonyms carry
 * their own `lang`/`dir` so assistive tech pronounces them correctly.
 */
export const LanguageDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
  languages,
  onSelectLanguage,
  translationLinkHref,
}: LanguageDialogProps) => {
  const handleChooseLanguage = useCallback(
    async (languageId: KnownLanguageId) => {
      await onSelectLanguage(languageId);
      onClose();
    },
    [onClose, onSelectLanguage],
  );
  const previewNoticeId = useId();
  const ordered = [...languages].sort(
    (a, b) => languageOrder(a.id) - languageOrder(b.id),
  );
  const fully = ordered.filter((l) => !isPartiallySupported(l));
  const partially = ordered.filter(isPartiallySupported);
  const hasPreviewLanguages = ordered.some((l) => l.preview);
  // With only a handful of languages the family-size dialog rattles around
  // (data.microbit.org offers two), so compact to two columns in a narrower
  // modal. Beyond the threshold the third column starts paying its way.
  const compact = languages.length <= 6;
  const languageGrid = (items: LanguageDialogLanguage[]) => (
    <Grid
      width="100%"
      columns={compact ? { base: 1, sm: 2 } : { base: 1, sm: 2, md: 3 }}
      gap={4}
    >
      {items.map((language) => (
        <LanguageCard
          key={language.id}
          language={language}
          onChooseLanguage={handleChooseLanguage}
          previewNoticeId={previewNoticeId}
        />
      ))}
    </Grid>
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={compact ? { base: "full", md: "xl" } : { base: "full", md: "4xl" }}
      finalFocusRef={finalFocusRef}
    >
      <ModalHeader css={{ fontSize: "lg", fontWeight: "bold" }}>
        <FormattedMessage {...uiPatternsMessage("ui-patterns.language")} />
      </ModalHeader>
      <ModalBody>
        <VStack gap={3} width="100%">
          {partially.length > 0 && (
            <SectionHeading messageId="ui-patterns.language-fully-supported-heading" />
          )}
          {languageGrid(fully)}
          {partially.length > 0 && (
            <>
              <SectionHeading
                spaced
                messageId="ui-patterns.language-partially-supported-heading"
              />
              {languageGrid(partially)}
            </>
          )}
          {hasPreviewLanguages && (
            <Text
              id={previewNoticeId}
              fontSize="xs"
              alignSelf="flex-start"
              mt={1}
            >
              <FormattedMessage
                {...uiPatternsMessage("ui-patterns.language-preview-notice")}
              />
            </Text>
          )}
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Flex
          direction={{ base: "column", md: "row" }}
          justifyContent={translationLinkHref ? "space-between" : "flex-end"}
          alignItems={{ base: "flex-start", md: "center" }}
          gap={{ base: 4, md: 0 }}
          width="100%"
        >
          {translationLinkHref && (
            <ExternalLink
              href={translationLinkHref}
              css={{ fontSize: "md", color: "fg.link" }}
            >
              <FormattedMessage
                {...uiPatternsMessage("ui-patterns.help-translate")}
              />
            </ExternalLink>
          )}
          <Button variant="primary" onPress={onClose} css={{ ms: "auto" }}>
            <FormattedMessage {...uiMessage("ui.close-action")} />
          </Button>
        </Flex>
      </ModalFooter>
    </Modal>
  );
};

const SectionHeading = ({
  messageId,
  spaced = false,
}: {
  messageId:
    | "ui-patterns.language-fully-supported-heading"
    | "ui-patterns.language-partially-supported-heading";
  spaced?: boolean;
}) => (
  <Text
    // h3: the dialog's own title (ModalHeader) is the h2.
    as="h3"
    fontSize="md"
    fontWeight="bold"
    textAlign="start"
    width="100%"
    marginTop={spaced ? "1em" : "0"}
  >
    <FormattedMessage {...uiPatternsMessage(messageId)} />
  </Text>
);

interface LanguageCardProps {
  language: LanguageDialogLanguage;
  onChooseLanguage: (languageId: KnownLanguageId) => void | Promise<void>;
  /** id of the dialog's preview footnote, described-by on preview cards. */
  previewNoticeId: string;
}

const LanguageCard = ({
  language,
  onChooseLanguage,
  previewNoticeId,
}: LanguageCardProps) => {
  const intl = useIntl();
  const toast = useToast();
  const registryEntry = languageFromId(language.id);
  const name = language.name ?? registryEntry.name;
  const enName = language.enName ?? registryEntry.enName;
  const nameId = useId();
  const enNameId = useId();
  const showSupport = isPartiallySupported(language);
  const handleSelect = useCallback(() => {
    void onChooseLanguage(language.id);
    if (showSupport) {
      toast({
        // An element rather than `intl.formatMessage`: this runs in the same
        // tick as the language change, so a formatted string would freeze the
        // language the user just left, leaving the title in the old language
        // above a description that had already re-rendered in the new one.
        title: (
          <FormattedMessage
            {...uiPatternsMessage("ui-patterns.language-toast-title")}
          />
        ),
        description: <SupportStatement support={language.support ?? []} />,
        status: "info",
        isClosable: true,
        // The dialog (and its support tooltip) is gone by the time this
        // shows, so give the checklist longer than the 5s default.
        duration: 10_000,
      });
    }
  }, [language.id, language.support, onChooseLanguage, showSupport, toast]);

  // The selection button covers the whole card; the visible content sits
  // above it, and the warning tooltip trigger is a sibling.
  // react-aria-components disallows nesting a focusable tooltip trigger
  // inside a button, so we use this overlay pattern to keep the tooltip
  // anchored on the warning icon. The button's accessible name comes from
  // the name elements via aria-labelledby (not aria-label) so their `lang`
  // attributes carry into the announcement.
  return (
    <Box position="relative" w="100%">
      <Button
        variant="plain"
        aria-labelledby={`${nameId} ${enNameId}`}
        aria-describedby={language.preview ? previewNoticeId : undefined}
        onPress={handleSelect}
        data-testid={language.id}
        css={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: "xl",
          borderWidth: "2px",
          borderColor: "border.default",
          _hover: { bg: "surface.highlight" },
        }}
      />
      <VStack
        alignItems="flex-start"
        w="100%"
        css={{
          position: "relative",
          pointerEvents: "none",
          py: 4,
          px: 5,
          color: "languageDialog.fg",
          // The visible content is a sibling of the button, not a child, so
          // the hover recolour needs an explicit sibling selector.
          "button[data-hovered] + &": { color: "languageDialog.fgHover" },
        }}
      >
        <Text
          id={nameId}
          as="span"
          lang={language.id}
          dir="auto"
          fontSize="xl"
          fontWeight="semibold"
        >
          {name}
        </Text>
        <HStack w="100%" justifyContent="space-between">
          <Text
            id={enNameId}
            as="span"
            lang="en"
            fontWeight="normal"
            fontSize="sm"
            color="fg.muted"
          >
            {enName}
            {/* Visual pointer to the footnote; the accessible link is the
                button's aria-describedby, so keep the star out of the name. */}
            {language.preview && <span aria-hidden="true">*</span>}
          </Text>
          {showSupport && (
            <Box
              css={{
                pointerEvents: "auto",
                color: "fg.subtle",
                display: "inline-flex",
              }}
            >
              <TooltipButton
                hasArrow
                placement="top"
                // A short name; the full statement stays the description
                // rather than being read out as the button's name.
                aria-label={intl.formatMessage(
                  uiPatternsMessage("ui-patterns.language-toast-title"),
                )}
                css={{ px: 3, py: 3 }}
                label={
                  <Stack>
                    <Text fontWeight="bold">
                      <FormattedMessage
                        {...uiPatternsMessage(
                          "ui-patterns.language-toast-title",
                        )}
                      />
                    </Text>
                    <SupportStatement support={language.support ?? []} />
                  </Stack>
                }
              >
                <Icon as={RiErrorWarningLine} />
              </TooltipButton>
            </Box>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

const SupportStatement = ({
  support,
}: {
  support: LanguageDialogSupportItem[];
}) => (
  <Text as="div">
    <Text as="div" pb={1}>
      <FormattedMessage
        {...uiPatternsMessage("ui-patterns.language-supported-for")}
      />
    </Text>
    <List>
      {support.map((item) => (
        <SupportedListItem key={item.name} supported={item.supported}>
          {item.name}
        </SupportedListItem>
      ))}
    </List>
  </Text>
);

const SupportedListItem = ({
  children,
  supported,
}: {
  children: ReactNode;
  supported: boolean;
}) => {
  const intl = useIntl();
  return (
    <ListItem>
      <Icon
        css={{ fontSize: "1.2em", verticalAlign: "middle" }}
        as={supported ? RiCheckboxLine : RiCheckboxBlankLine}
        aria-label={intl.formatMessage(
          uiPatternsMessage(
            supported
              ? "ui-patterns.language-support-checked"
              : "ui-patterns.language-support-unchecked",
          ),
        )}
      />{" "}
      {children}
    </ListItem>
  );
};
