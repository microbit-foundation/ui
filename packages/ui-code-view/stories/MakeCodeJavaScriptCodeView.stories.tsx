/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
// Relative rather than the package name, whose exports point at the built
// dist/ that may not exist yet.
import { MakeCodeJavaScriptCodeView } from "../src";

const meta = {
  title: "Code view/MakeCodeJavaScriptCodeView",
  component: MakeCodeJavaScriptCodeView,
} satisfies Meta<typeof MakeCodeJavaScriptCodeView>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    code: `function convertCtoF (C: number) {
  return C * 1.8 + 32
}
input.onButtonPressed(Button.A, function () {
  basic.showNumber(input.temperature())
})
input.onButtonPressed(Button.B, function () {
  basic.showNumber(convertCtoF(input.temperature()))
})
let myString = "Hello, world!"
// Comments and booleans are coloured too
let ready = true`,
  },
};
