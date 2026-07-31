/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Svg } from "../src";

const meta = {
  title: "Media & icons/Svg",
  component: Svg,
} satisfies Meta<typeof Svg>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Svg viewBox="0 0 24 24" fontSize="4xl" color="blue.600" aria-hidden>
      <path
        fill="currentColor"
        d="M12 21 4 13.5a5.5 5.5 0 1 1 8-7.6 5.5 5.5 0 1 1 8 7.6Z"
      />
    </Svg>
  ),
};
