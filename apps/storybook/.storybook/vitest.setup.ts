/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
