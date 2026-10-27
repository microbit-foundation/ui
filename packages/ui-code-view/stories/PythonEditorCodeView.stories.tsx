/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
// Relative rather than the package name, whose exports point at the built
// dist/ that may not exist yet.
import { PythonEditorCodeView } from "../src";

const meta = {
  title: "Code view/PythonEditorCodeView",
  component: PythonEditorCodeView,
} satisfies Meta<typeof PythonEditorCodeView>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The Python Editor's starter project. */
export const StarterCode: Story = {
  args: {
    code: `# Imports go at the top
from microbit import *


# Code in a 'while True:' loop repeats forever
while True:
    display.show(Image.HEART)
    sleep(1000)
    display.scroll('Hello')
`,
  },
};

/**
 * Wide enough to scroll sideways, which puts the code in the tab order so a
 * keyboard can scroll it.
 */
export const LongLine: Story = {
  args: {
    code: `from microbit import *

display.scroll("This message is long enough that the line runs past the edge of most screens, so the code scrolls sideways")
`,
  },
};
