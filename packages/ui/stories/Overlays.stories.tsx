/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RiSettings2Line } from "react-icons/ri";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
  HStack,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuTrigger,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Text,
  Tooltip,
} from "../src";

const meta = {
  title: "Components/Overlays",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const ModalDialog: Story = {
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onPress={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
          <ModalCloseButton />
          <ModalHeader>Modal title</ModalHeader>
          <ModalBody>
            <Text>
              Focus lands on the dialog itself on open, and returns to the
              trigger on close.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onPress={() => setOpen(false)}>
              Done
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const DrawerPanel: Story = {
  render: () => {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer isOpen={isOpen} onClose={() => setOpen(false)}>
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

export const Menu: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" leftIcon={<RiSettings2Line />}>
        Menu
      </Button>
      <MenuList>
        <MenuItem onAction={() => undefined}>First item</MenuItem>
        <MenuItem onAction={() => undefined}>Second item</MenuItem>
        <MenuDivider />
        <MenuItem onAction={() => undefined}>Delete</MenuItem>
      </MenuList>
    </MenuTrigger>
  ),
};

export const TooltipTrigger: Story = {
  render: () => (
    <HStack gap={4}>
      <Tooltip label="Tooltips match Chakra's dark style" hasArrow>
        <Button variant="ghost">Hover me</Button>
      </Tooltip>
    </HStack>
  ),
};
