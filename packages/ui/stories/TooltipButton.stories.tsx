/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiErrorWarningLine, RiInformationLine } from "react-icons/ri";
import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  Tooltip,
  TooltipButton,
  VStack,
} from "../src";
import { useState } from "react";

const meta = {
  title: "Overlays/TooltipButton",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <HStack gap={3}>
      <Heading size="lg">My projects</Heading>
      <TooltipButton
        aria-label="About project storage"
        placement="end"
        hasArrow
        css={{ px: 3, py: 3 }}
        label={
          <Text>
            Your data is saved in this browser on this device. Clearing your
            browser&apos;s cookies or site data will delete it.
          </Text>
        }
      >
        <Icon
          as={RiInformationLine}
          css={{ opacity: 0.7, width: 5, height: 5 }}
        />
      </TooltipButton>
    </HStack>
  ),
};

/**
 * Hover it, tab to it, press Enter or Space to toggle, Escape to dismiss, and
 * move the pointer onto the tooltip to keep it open. Only one tooltip on the
 * page is ever open at once, including plain `Tooltip`s.
 */
export const Interactions: Story = {
  render: () => (
    <HStack gap={6}>
      {["First", "Second", "Third"].map((name) => (
        <HStack key={name} gap={2}>
          <Text>{name}</Text>
          <TooltipButton
            aria-label={`About ${name}`}
            hasArrow
            css={{ px: 3, py: 3 }}
            label={<Text>Information about {name}.</Text>}
          >
            <Icon as={RiErrorWarningLine} css={{ color: "gray.500" }} />
          </TooltipButton>
        </HStack>
      ))}
    </HStack>
  ),
};

/**
 * Inside a modal the tooltip is portalled into a container react-aria has
 * marked inert, so it cannot receive mouse events; it stays open on hover
 * anyway, via pointer geometry.
 */
export const InModal: Story = {
  render: function InModalStory() {
    const [isOpen, setOpen] = useState(false);
    return (
      // Full height on purpose: overlays inside a Modal position against the
      // document, so in a story whose body is shorter than the viewport every
      // tooltip — plain ones too — lands hundreds of pixels above its trigger.
      <Box css={{ minHeight: "100vh" }}>
        <Button variant="primary" onPress={() => setOpen(true)}>
          Open dialog
        </Button>
        <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
          <ModalHeader>Language</ModalHeader>
          <ModalBody>
            <VStack gap={4} alignItems="flex-start">
              <HStack gap={2}>
                <Text>Cymraeg</Text>
                <TooltipButton
                  aria-label="Language not fully supported"
                  hasArrow
                  css={{ px: 3, py: 3 }}
                  label={
                    <VStack gap={1} alignItems="flex-start">
                      <Text fontWeight="bold">
                        Language not fully supported
                      </Text>
                      <Text>Translations supported for MakeCode only.</Text>
                    </VStack>
                  }
                >
                  <Icon as={RiErrorWarningLine} css={{ color: "gray.500" }} />
                </TooltipButton>
              </HStack>
              <Tooltip label="A plain tooltip, for comparison" hasArrow>
                <Button variant="secondary">Hover me</Button>
              </Tooltip>
              <Text>Escape closes the tooltip, not the dialog.</Text>
            </VStack>
          </ModalBody>
        </Modal>
      </Box>
    );
  },
};
