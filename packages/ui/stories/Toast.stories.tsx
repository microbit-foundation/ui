/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button, HStack, toastQueue, useToast } from "../src";

const meta = {
  title: "Feedback/Toast",
  // The queue is module-level, so persistent toasts would outlive the story.
  // close() rather than clear(): it runs each toast's onClose, which frees
  // its id for dedup.
  beforeEach: () => () => {
    while (toastQueue.visibleToasts.length > 0) {
      toastQueue.close(toastQueue.visibleToasts[0].key);
    }
  },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Statuses: Story = {
  render: () => {
    const toast = useToast();
    return (
      <HStack gap={4} flexWrap="wrap">
        {(["info", "success", "warning", "error"] as const).map((status) => (
          <Button
            key={status}
            variant="secondary"
            onPress={() =>
              toast({
                title: `${status[0].toUpperCase()}${status.slice(1)} toast`,
                description: "This is a toast notification.",
                status,
              })
            }
          >
            {status}
          </Button>
        ))}
      </HStack>
    );
  },
};

export const Dismissal: Story = {
  render: () => {
    const toast = useToast();
    return (
      <HStack gap={4} flexWrap="wrap">
        <Button
          variant="secondary"
          onPress={() =>
            toast({
              title: "Persistent toast",
              description: "Stays until closed.",
              status: "error",
              persistent: true,
            })
          }
        >
          Add persistent
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            toast({
              id: "unique",
              title: "Deduplicated toast",
              description: "Re-adding the same id while visible is a no-op.",
              status: "info",
              persistent: true,
            })
          }
        >
          Add with id
        </Button>
        <Button variant="secondary" onPress={() => toast.closeAll()}>
          Close all
        </Button>
      </HStack>
    );
  },
  // Raises a persistent toast so it's still up for the axe scan that runs
  // after play. The region is portalled to <body>, which the scan covers.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Add persistent" }),
    );
    const page = within(canvasElement.ownerDocument.body);
    const toast = await page.findByRole("alertdialog", {
      name: "Persistent toast",
    });
    await expect(toast).toHaveAccessibleDescription("Stays until closed.");
  },
};
