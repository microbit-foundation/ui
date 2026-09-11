/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UnexpectedErrorPage } from "../src";

const meta = {
  title: "Patterns/UnexpectedErrorPage",
  component: UnexpectedErrorPage,
  args: {
    supportUrl: "https://support.microbit.org/support/home/",
    onReload: () => alert("reload"),
  },
} satisfies Meta<typeof UnexpectedErrorPage>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The reference is the Sentry event id, for quoting in support requests. */
export const WithReference: Story = {
  args: {
    reference: "5f1e7a2c9b3d4e6f8a0b1c2d3e4f5a6b",
  },
};

/** When the error was not reported there is no reference to show. */
export const WithoutReference: Story = {};

/**
 * The children slot is for a recovery action the app can still offer after a
 * render error, e.g. the Python Editor's file system outlives a crashed UI so
 * the project can still be downloaded.
 */
export const WithRecoveryAction: Story = {
  args: {
    reference: "5f1e7a2c9b3d4e6f8a0b1c2d3e4f5a6b",
    children: (
      <Button variant="secondary" onPress={() => alert("download")}>
        Download your project
      </Button>
    ),
  },
};
