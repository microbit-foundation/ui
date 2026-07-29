/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, HStack, useToast } from "../src";

const meta = {
  title: "Feedback/Toast",
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
              isClosable: true,
              duration: null,
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
              duration: null,
              isClosable: true,
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
};
