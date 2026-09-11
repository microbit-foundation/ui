/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Code,
  ExternalLink,
  HStack,
  Icon,
  IconButton,
  Text,
  useClipboard,
} from "@microbit/ui";
import { ReactNode } from "react";
import { RiCheckLine, RiFileCopyLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { ErrorPage } from "./ErrorPage";
import { uiPatternsMessage } from "./messages";

export interface UnexpectedErrorPageProps {
  /** Where "raising a support request" links to. */
  supportUrl: string;
  /**
   * Identifies the error report, typically the Sentry event id, so a support
   * request quoting it can be matched to the report. Omit when the error was
   * not reported.
   */
  reference?: string;
  /** Replaces the default action of reloading the page. */
  onReload?: () => void;
  /**
   * Extra content between the standard text and the reload button, for a
   * recovery action the app can still offer.
   */
  children?: ReactNode;
}

const reloadPage = () => window.location.reload();

/**
 * The page shown when the app cannot continue: an apology, a support link,
 * the error reference and a reload button.
 */
export const UnexpectedErrorPage = ({
  supportUrl,
  reference,
  onReload = reloadPage,
  children,
}: UnexpectedErrorPageProps) => (
  <ErrorPage
    title={
      <FormattedMessage
        {...uiPatternsMessage("ui-patterns.unexpected-error-title")}
      />
    }
  >
    <Text>
      <FormattedMessage
        {...uiPatternsMessage("ui-patterns.support-request")}
        values={{
          link: (chunks: ReactNode) => (
            <ExternalLink href={supportUrl} color="brand.600">
              {chunks}
            </ExternalLink>
          ),
        }}
      />
    </Text>
    {reference && <ErrorReference reference={reference} />}
    {children}
    <Box mt={2}>
      <Button variant="primary" onPress={onReload}>
        <FormattedMessage {...uiPatternsMessage("ui-patterns.reload-action")} />
      </Button>
    </Box>
  </ErrorPage>
);

/**
 * The reference with a copy button: an event id is too long to retype into
 * a support form reliably.
 */
const ErrorReference = ({ reference }: { reference: string }) => {
  const intl = useIntl();
  const { onCopy, hasCopied } = useClipboard(reference);
  return (
    <HStack gap={1} justifyContent="center" flexWrap="wrap">
      <Text>
        <FormattedMessage
          {...uiPatternsMessage("ui-patterns.error-reference")}
          values={{ id: <Code>{reference}</Code> }}
        />
      </Text>
      <IconButton
        variant="ghost"
        size="sm"
        onPress={onCopy}
        aria-label={intl.formatMessage(
          uiPatternsMessage(
            hasCopied
              ? "ui-patterns.copied-feedback"
              : "ui-patterns.copy-error-reference-action",
          ),
        )}
      >
        <Icon as={hasCopied ? RiCheckLine : RiFileCopyLine} />
      </IconButton>
    </HStack>
  );
};
