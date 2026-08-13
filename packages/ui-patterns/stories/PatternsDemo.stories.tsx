/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PatternsDemo } from "../src";

const meta = {
  title: "Patterns/PatternsDemo",
  component: PatternsDemo,
} satisfies Meta<typeof PatternsDemo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
