/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, HStack, ProgressBar, Spinner, useToast } from "../src";

const meta = {
  title: "Components/Feedback",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Spinners: Story = {
  render: () => (
    <HStack gap={6} alignItems="center">
      <Spinner aria-label="Loading" size="sm" />
      <Spinner aria-label="Loading" size="md" />
    </HStack>
  ),
};

export const Progress: Story = {
  render: () => (
    <Box maxW="md">
      <ProgressBar aria-label="Progress" value={60} />
    </Box>
  ),
};

export const Toasts: Story = {
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
        <Button
          variant="secondary"
          onPress={() =>
            toast({
              title: "Persistent toast",
              status: "error",
              duration: null,
            })
          }
        >
          persistent
        </Button>
      </HStack>
    );
  },
};
