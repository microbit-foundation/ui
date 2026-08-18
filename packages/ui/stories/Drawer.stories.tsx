/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
  Text,
} from "../src";

const meta = {
  title: "Overlays/Drawer",
  args: { placement: "start" as "start" | "end" },
  argTypes: {
    placement: { control: "select", options: ["start", "end"] },
  },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setOpen(false)}>
          <DrawerHeader>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Text>Drawer content.</Text>
          </DrawerBody>
        </Drawer>
      </>
    );
  },
};
