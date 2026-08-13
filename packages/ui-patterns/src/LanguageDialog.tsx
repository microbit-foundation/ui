/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Link,
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
  RiCheckLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
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
   * When false the language is listed under a "Partially supported" heading,
   * with a warning tooltip and a post-selection toast explaining `support`.
   * Defaults to true.
   */
  fullySupported?: boolean;
  /**
   * Per-product translation coverage shown for a partially supported
   * language. Only rendered when `fullySupported` is false.
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

export interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to, typically the settings menu button. */
  finalFocusRef?: RefObject<HTMLElement>;
  /** Languages to offer, in any order; the dialog sorts by registry order. */
  languages: LanguageDialogLanguage[];
  /** The active language, marked on its card. */
  currentLanguageId?: string;
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
 * name), split into fully/partially supported sections when the app reports
 * partial support. Selection applies immediately: no confirm step, no page
 * reload expected. The current language is marked; endonyms carry their own
 * `lang`/`dir` so assistive tech pronounces them correctly.
 */
export const LanguageDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
  languages,
  currentLanguageId,
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
  const ordered = [...languages].sort(
    (a, b) => languageOrder(a.id) - languageOrder(b.id),
  );
  const fully = ordered.filter((l) => l.fullySupported !== false);
  const partially = ordered.filter((l) => l.fullySupported === false);
  const hasPreviewLanguages = ordered.some((l) => l.preview);
  const languageGrid = (items: LanguageDialogLanguage[]) => (
    <Grid width="100%" columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
      {items.map((language) => (
        <LanguageCard
          key={language.id}
          language={language}
          isCurrent={language.id === currentLanguageId}
          onChooseLanguage={handleChooseLanguage}
        />
      ))}
    </Grid>
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "4xl" }}
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
            <Text fontSize="xs" alignSelf="flex-end" mt={1}>
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
            <Link
              href={translationLinkHref}
              target="_blank"
              rel="noopener"
              css={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                fontSize: "md",
                fontWeight: "semibold",
                color: "brand.500",
              }}
            >
              <FormattedMessage
                {...uiPatternsMessage("ui-patterns.help-translate")}
              />
              <Icon as={RiExternalLinkLine} aria-hidden />
            </Link>
          )}
          <Button variant="primary" onPress={onClose} css={{ ml: "auto" }}>
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
    as="h2"
    fontSize="md"
    fontWeight="bold"
    textAlign="left"
    width="100%"
    marginTop={spaced ? "1em" : "0"}
  >
    <FormattedMessage {...uiPatternsMessage(messageId)} />
  </Text>
);

interface LanguageCardProps {
  language: LanguageDialogLanguage;
  isCurrent: boolean;
  onChooseLanguage: (languageId: KnownLanguageId) => void | Promise<void>;
}

const LanguageCard = ({
  language,
  isCurrent,
  onChooseLanguage,
}: LanguageCardProps) => {
  const intl = useIntl();
  const toast = useToast();
  const registryEntry = languageFromId(language.id);
  const name = language.name ?? registryEntry.name;
  const enName = language.enName ?? registryEntry.enName;
  const nameId = useId();
  const enNameId = useId();
  const showSupport =
    language.fullySupported === false && (language.support?.length ?? 0) > 0;
  const handleSelect = useCallback(() => {
    void onChooseLanguage(language.id);
    if (showSupport) {
      toast({
        title: intl.formatMessage(
          uiPatternsMessage("ui-patterns.language-toast-title"),
        ),
        description: <SupportStatement support={language.support ?? []} />,
        status: "info",
        isClosable: true,
      });
    }
  }, [
    intl,
    language.id,
    language.support,
    onChooseLanguage,
    showSupport,
    toast,
  ]);

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
        aria-current={isCurrent ? "true" : undefined}
        onPress={handleSelect}
        data-testid={language.id}
        css={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: "xl",
          borderWidth: "2px",
          borderColor: isCurrent ? "languageText" : "gray.200",
          _hover: { bg: "gray.100" },
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
          color: "languageText",
          // The visible content is a sibling of the button, not a child, so
          // the hover recolour needs an explicit sibling selector.
          "button[data-hovered] + &": { color: "languageTextHover" },
        }}
      >
        <HStack gap={2}>
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
          {isCurrent && <Icon as={RiCheckLine} aria-hidden />}
        </HStack>
        <HStack w="100%" justifyContent="space-between">
          <Text
            id={enNameId}
            as="span"
            lang="en"
            fontWeight="normal"
            fontSize="sm"
            color="gray.700"
          >
            {enName}
            {language.preview ? "*" : ""}
          </Text>
          {showSupport && (
            <Box
              css={{
                pointerEvents: "auto",
                color: "gray.500",
                display: "inline-flex",
              }}
            >
              <TooltipButton
                hasArrow
                placement="top"
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
