/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorPage } from "../src";

const meta = {
  title: "Patterns/ErrorPage",
  component: ErrorPage,
} satisfies Meta<typeof ErrorPage>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The layout on its own, for an app's own terminal states. This is
 * ml-trainer's pre-release page for a stored-data format change, which the
 * apps that assert their IndexedDB schema on open all need.
 */
export const StorageVersionError: Story = {
  args: {
    title: "Breaking change to stored data",
    children: (
      <>
        <Text maxW="md">
          The storage format has changed in this pre-release version and the old
          data format is not supported.
        </Text>
        <Button variant="primary" onPress={() => alert("clear and reload")}>
          Clear data and reload
        </Button>
      </>
    ),
  },
};
