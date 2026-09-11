/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Heading, VStack } from "@microbit/ui";
import { ReactNode, useEffect, useRef } from "react";

export interface ErrorPageProps {
  title: ReactNode;
  children?: ReactNode;
}

/**
 * Full-page layout for terminal states: a centred heading with the
 * explanation and actions beneath it. `UnexpectedErrorPage` and
 * `NotFoundPage` use it; apps can use it for their own cases.
 *
 * Focus moves to the heading on mount. These pages replace whatever the user
 * was doing, often without any interaction of theirs, and without this a
 * screen reader user is left on a focus target that no longer exists.
 */
export const ErrorPage = ({ title, children }: ErrorPageProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <VStack
      as="main"
      minH="100vh"
      w="100%"
      px={4}
      py={8}
      gap={10}
      justifyContent="center"
      alignItems="center"
      bgColor="whitesmoke"
    >
      <Heading
        ref={headingRef}
        as="h1"
        tabIndex={-1}
        textAlign="center"
        outline="none"
      >
        {title}
      </Heading>
      <VStack gap={3} maxW="md" textAlign="center">
        {children}
      </VStack>
    </VStack>
  );
};
