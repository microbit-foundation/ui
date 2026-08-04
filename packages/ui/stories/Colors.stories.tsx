/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { HStack, Text, VStack } from "../src";

const meta = {
  title: "Foundations/Colors",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

// Swatches read their colour back from the rendered element rather than from
// a hardcoded table, so with a private brand preset in the stack they show
// the *private* values — which is the interesting case. The block's
// background is the token's CSS var directly (an inline style, since a
// token name built in a loop is invisible to Panda's static extraction).

const relativeLuminance = (r: number, g: number, b: number) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrastOnWhite = (rgb: string): number | undefined => {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return undefined;
  const l = relativeLuminance(Number(m[1]), Number(m[2]), Number(m[3]));
  return 1.05 / (l + 0.05);
};

const toHex = (rgb: string): string => {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return rgb;
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((c) => Number(c).toString(16).padStart(2, "0"))
      .join("")
  );
};

const Swatch = ({ ramp, stop }: { ramp: string; stop: number | string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState<string>();
  useEffect(() => {
    if (ref.current) {
      setResolved(getComputedStyle(ref.current).backgroundColor);
    }
  }, []);
  const contrast = resolved ? contrastOnWhite(resolved) : undefined;
  return (
    <HStack gap={4}>
      <div
        ref={ref}
        style={{
          background: `var(--colors-${ramp}-${stop})`,
          width: "12rem",
          height: "3rem",
          borderRadius: "0.375rem",
          // A hairline so the near-white stops read against the canvas.
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
        }}
      />
      <Text css={{ w: "16", fontWeight: "semibold", fontFamily: "mono" }}>
        {stop}
      </Text>
      <Text css={{ w: "24", fontFamily: "mono" }}>
        {resolved ? toHex(resolved) : "…"}
      </Text>
      <Text css={{ fontFamily: "mono", color: "gray.600" }}>
        {contrast ? `${contrast.toFixed(2)}:1 on white` : ""}
      </Text>
    </HStack>
  );
};

const Ramp = ({
  ramp,
  stops,
}: {
  ramp: string;
  stops: (number | string)[];
}) => (
  <VStack alignItems="stretch" gap={2}>
    {stops.map((stop) => (
      <Swatch key={stop} ramp={ramp} stop={stop} />
    ))}
  </VStack>
);

export const Grays: Story = {
  render: () => (
    <Ramp
      ramp="gray"
      stops={[10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
    />
  ),
};
