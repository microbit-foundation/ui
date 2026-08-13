/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@microbit/ui";
import { css } from "styled-system/css";

export interface PatternsDemoProps {
  onPress?: () => void;
}

/**
 * Placeholder proving the package wiring: it composes an @microbit/ui
 * component and carries its own Panda styles, so a consumer that resolves,
 * compiles and extracts this package correctly renders a framed button.
 * Delete when the first real pattern lands.
 */
export const PatternsDemo = ({ onPress }: PatternsDemoProps) => (
  <div
    className={css({
      display: "inline-flex",
      p: 4,
      borderWidth: "1px",
      borderColor: "gray.200",
      rounded: "lg",
    })}
  >
    <Button variant="primary" onPress={onPress}>
      @microbit/ui-patterns
    </Button>
  </div>
);
