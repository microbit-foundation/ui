/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiArrowRightSLine } from "react-icons/ri";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
} from "../src";

const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: (
      <>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Activities</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Data logging</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Playground survey</BreadcrumbLink>
        </BreadcrumbItem>
      </>
    ),
  },
};

export const IconSeparator: Story = {
  // data-microbit-org's teacher pages: a chevron separator and xl text.
  args: {
    separator: <Icon as={RiArrowRightSLine} />,
    css: { fontSize: "xl" },
    children: (
      <>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Activity uploads</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Tracking our physical activity</BreadcrumbLink>
        </BreadcrumbItem>
      </>
    ),
  },
};
