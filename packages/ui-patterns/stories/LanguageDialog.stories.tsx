/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Button, useDisclosure } from "@microbit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import {
  LanguageDialog,
  LanguageDialogLanguage,
  LanguageDialogProps,
} from "../src";

/**
 * An app-shaped harness: open button (also the finalFocusRef target), state
 * for the current language, full-height box so the modal positions as it
 * would on a real page.
 */
const Harness = (
  props: Omit<LanguageDialogProps, "isOpen" | "onClose" | "onSelectLanguage">,
) => {
  const disclosure = useDisclosure();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [languageId, setLanguageId] = useState<string>("en");
  return (
    <Box height="100vh" p={4}>
      <Button variant="secondary" ref={buttonRef} onPress={disclosure.onOpen}>
        Language: {languageId}
      </Button>
      <LanguageDialog
        isOpen={disclosure.isOpen}
        onClose={disclosure.onClose}
        finalFocusRef={buttonRef}
        onSelectLanguage={(id) => setLanguageId(id)}
        {...props}
      />
    </Box>
  );
};

const meta = {
  title: "Patterns/LanguageDialog",
  component: Harness,
} satisfies Meta<typeof Harness>;
export default meta;

type Story = StoryObj<typeof meta>;

const simple: LanguageDialogLanguage[] = [
  { id: "en" },
  { id: "cy" },
  { id: "fr" },
  { id: "ja" },
  { id: "nl" },
  { id: "pl" },
  { id: "pt-BR" },
];

/** The flat shape: every language fully supported (python-editor, data). */
export const AllSupported: Story = {
  args: { languages: simple },
};

/**
 * The sectioned shape (ml-trainer, classroom): partially supported languages
 * get their own heading, a warning tooltip and a post-selection toast built
 * from the per-product support list.
 */
export const WithPartialSupport: Story = {
  args: {
    languages: [
      { id: "en", name: "English (UK)", enName: "English (UK)" },
      { id: "en-US" },
      { id: "fr" },
      { id: "ja" },
      {
        id: "ar",
        fullySupported: false,
        support: [
          { name: "Microsoft MakeCode", supported: true },
          { name: "micro:bit CreateAI", supported: false },
        ],
      },
      {
        id: "bg",
        fullySupported: false,
        support: [
          { name: "Microsoft MakeCode", supported: true },
          { name: "micro:bit CreateAI", supported: false },
        ],
      },
    ],
    translationLinkHref: "https://crowdin.com/project/microbitorg",
  },
};

/** Preview languages: asterisked English name plus the footnote. */
export const WithPreviewLanguages: Story = {
  args: {
    languages: [
      { id: "en" },
      { id: "cy" },
      { id: "fr", preview: true },
      { id: "ja", preview: true },
    ],
  },
};

/** Every language the family knows, as a registry visual check. */
export const AllKnownLanguages: Story = {
  args: {
    languages: [
      { id: "en" },
      { id: "ar" },
      { id: "bg" },
      { id: "ca" },
      { id: "zh-CN" },
      { id: "zh-TW" },
      { id: "cs" },
      { id: "da" },
      { id: "nl" },
      { id: "en-US" },
      { id: "fi" },
      { id: "fr" },
      { id: "de" },
      { id: "el" },
      { id: "gn" },
      { id: "he" },
      { id: "hu" },
      { id: "is" },
      { id: "ga-IE" },
      { id: "it" },
      { id: "ja" },
      { id: "ko" },
      { id: "lo" },
      { id: "nb" },
      { id: "nn-NO" },
      { id: "pl" },
      { id: "pt-BR" },
      { id: "pt-PT" },
      { id: "ru" },
      { id: "sr" },
      { id: "si-LK" },
      { id: "sk" },
      { id: "es-ES" },
      { id: "sv-SE" },
      { id: "tr" },
      { id: "uk" },
      { id: "vi" },
      { id: "cy" },
    ],
  },
};
