/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { YoutubeVideoEmbed, YoutubeVideoEmbedProps } from "../src";

const meta = {
  title: "Patterns/YoutubeVideoEmbed",
  component: YoutubeVideoEmbed,
} satisfies Meta<typeof YoutubeVideoEmbed>;
export default meta;

type Story = StoryObj<typeof meta>;

// The micro:bit classroom welcome video.
const args = {
  youtubeId: "QD8kpuSC0Vc",
  title: "welcome video",
  alt: "video introducing micro:bit classroom",
};

export const Default: Story = {
  args,
  decorators: [
    (Story) => (
      <Box maxWidth="2xl" p={4}>
        <Story />
      </Box>
    ),
  ],
};

const DialogHarness = (props: YoutubeVideoEmbedProps) => {
  const disclosure = useDisclosure();
  return (
    <Box height="100vh" p={4}>
      <Button variant="secondary" onPress={disclosure.onOpen}>
        Open welcome dialog
      </Button>
      <Modal isOpen={disclosure.isOpen} onClose={disclosure.onClose} size="2xl">
        <ModalHeader>Welcome</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <YoutubeVideoEmbed {...props} />
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onPress={disclosure.onClose}>
            Get started
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

/**
 * The primary use: a welcome dialog. The facade is what keeps the dialog's
 * tab order working — an always-present iframe cannot be reached by Tab at
 * all in Firefox (react-aria's focus containment re-implements Tab with a
 * programmatic focus that Firefox drops for cross-origin iframes).
 *
 * On iOS/iPadOS there is no facade: the player renders upfront, since WebKit
 * won't autoplay the swapped-in iframe and would demand a second tap.
 */
export const InAWelcomeDialog: Story = {
  args,
  render: (props) => <DialogHarness {...props} />,
};
