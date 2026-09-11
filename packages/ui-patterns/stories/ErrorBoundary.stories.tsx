/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text, VStack } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ErrorBoundary, UnexpectedErrorPage } from "../src";

const meta = {
  title: "Patterns/ErrorBoundary",
  component: ErrorBoundary,
} satisfies Meta<typeof ErrorBoundary>;
export default meta;

type Story = StoryObj<typeof meta>;

const Crasher = () => {
  const [crash, setCrash] = useState(false);
  if (crash) {
    throw new Error("Deliberate render error");
  }
  return (
    <VStack p={8} alignItems="flex-start" gap={4}>
      <Text>Press the button to throw during render.</Text>
      <Button variant="secondary" onPress={() => setCrash(true)}>
        Crash
      </Button>
    </VStack>
  );
};

/**
 * The boundary calls `onError` once with the error, and whatever it returns
 * (here a fake event id, in an app the Sentry event id) becomes the reference
 * the fallback shows.
 */
export const WithUnexpectedErrorPage: Story = {
  args: {
    onError: (error) => {
      console.error(error);
      return "5f1e7a2c9b3d4e6f8a0b1c2d3e4f5a6b";
    },
    fallback: (_error, reference) => (
      <UnexpectedErrorPage
        supportUrl="https://support.microbit.org/support/home/"
        reference={reference}
        onReload={() => alert("reload")}
      />
    ),
    children: <Crasher />,
  },
};
