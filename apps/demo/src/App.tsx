/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
  Heading,
  HStack,
  Link,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuTrigger,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  NativeSelect,
  ProgressBar,
  Slider,
  Spinner,
  Stack,
  Switch,
  Text,
  TextField,
  Tooltip,
  useToast,
  VStack,
} from "@microbit/ui";
import { ReactNode, useState } from "react";
import { RiDownload2Line, RiSettings2Line } from "react-icons/ri";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <VStack alignItems="stretch" gap={4}>
    <Heading size="lg">{title}</Heading>
    {children}
    <Divider />
  </VStack>
);

export const App = () => {
  const toast = useToast();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(40);
  return (
    <Box maxW="4xl" mx="auto" px={8} py={12}>
      <VStack alignItems="stretch" gap={10}>
        <VStack alignItems="stretch" gap={2}>
          <Heading size="2xl">@microbit/ui demo</Heading>
          <Text>
            A kitchen sink of the shared components, consumed as a package the
            way an app would — see the <Link href="../..">package README</Link>{" "}
            for the setup this app demonstrates.
          </Text>
        </VStack>

        <Section title="Buttons">
          <HStack gap={4} flexWrap="wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="primary" isDisabled>
              Disabled
            </Button>
            <Button variant="primary" leftIcon={<RiDownload2Line />}>
              With icon
            </Button>
          </HStack>
        </Section>

        <Section title="Form controls">
          <Stack gap={6} maxW="md">
            <TextField label="Name" helperText="As shown on the certificate" />
            <TextField
              label="Project name"
              isInvalid
              errorMessage="A project name is required"
            />
            <NativeSelect aria-label="Language">
              <option>English</option>
              <option>Français</option>
              <option>日本語</option>
            </NativeSelect>
            <Checkbox defaultSelected>Remember this device</Checkbox>
            <Switch defaultSelected>Play sounds</Switch>
            <Slider
              aria-label="Certainty"
              value={sliderValue}
              onChange={setSliderValue}
              formatOptions={{ style: "unit", unit: "percent" }}
            />
          </Stack>
        </Section>

        <Section title="Feedback">
          <HStack gap={6} alignItems="center">
            <Spinner aria-label="Loading" />
            <Box flex="1">
              <ProgressBar aria-label="Progress" value={sliderValue} />
            </Box>
          </HStack>
          <HStack gap={4} flexWrap="wrap">
            <Button
              variant="secondary"
              onPress={() =>
                toast({
                  title: "Saved",
                  description: "Your project was saved.",
                  status: "success",
                })
              }
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onPress={() =>
                toast({
                  title: "Something went wrong",
                  status: "error",
                  duration: null,
                })
              }
            >
              Persistent error toast
            </Button>
          </HStack>
        </Section>

        <Section title="Overlays">
          <HStack gap={4} flexWrap="wrap">
            <Button variant="primary" onPress={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button variant="secondary" onPress={() => setDrawerOpen(true)}>
              Open drawer
            </Button>
            <MenuTrigger>
              <Button variant="secondary" leftIcon={<RiSettings2Line />}>
                Menu
              </Button>
              <MenuList>
                <MenuItem onAction={() => setModalOpen(true)}>
                  Open modal…
                </MenuItem>
                <MenuItem onAction={() => setDrawerOpen(true)}>
                  Open drawer…
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onAction={() => toast({ title: "Deleted", status: "info" })}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </MenuTrigger>
            <Tooltip label="Tooltips match Chakra's dark style" hasArrow>
              <Button variant="ghost">Hover me</Button>
            </Tooltip>
          </HStack>
          <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
            <ModalCloseButton />
            <ModalHeader>Modal title</ModalHeader>
            <ModalBody>
              <Text>
                Focus lands on the dialog itself on open, and returns to the
                trigger on close.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onPress={() => setModalOpen(false)}>
                Done
              </Button>
            </ModalFooter>
          </Modal>
          <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
            <DrawerHeader>
              <DrawerTitle>Drawer title</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <Text>Drawer content.</Text>
            </DrawerBody>
          </Drawer>
        </Section>

        <Section title="Content">
          <Card>
            <CardBody>
              <VStack alignItems="stretch" gap={2}>
                <Heading size="md">Card</Heading>
                <Text>
                  Cards, typography and <Link href="#">links</Link> use the
                  Chakra v2 design language on Panda CSS.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Section>
      </VStack>
    </Box>
  );
};
