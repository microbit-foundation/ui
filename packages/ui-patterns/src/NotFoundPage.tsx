/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link } from "@microbit/ui";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { ErrorPage } from "./ErrorPage";
import { uiPatternsMessage } from "./messages";

export interface NotFoundPageProps {
  /** The app's home page. A full navigation, which is fine for a dead end. */
  homeUrl: string;
  /** Replaces the default "Go to home page" link text. */
  homeLinkText?: ReactNode;
}

/**
 * The page shown for a URL the app does not recognise.
 */
export const NotFoundPage = ({ homeUrl, homeLinkText }: NotFoundPageProps) => (
  <ErrorPage
    title={
      <FormattedMessage {...uiPatternsMessage("ui-patterns.not-found-title")} />
    }
  >
    <Link href={homeUrl} color="brand.600">
      {homeLinkText ?? (
        <FormattedMessage
          {...uiPatternsMessage("ui-patterns.not-found-home-link")}
        />
      )}
    </Link>
  </ErrorPage>
);
