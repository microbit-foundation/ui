/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Box, Text, VStack } from "../src";

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
    <VStack alignItems="stretch" gap={1}>
      <div
        ref={ref}
        style={{
          background: `var(--colors-${ramp}-${stop})`,
          height: "4rem",
          borderRadius: "0.375rem",
          // A hairline so the near-white stops read against the canvas.
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
        }}
      />
      <Text
        css={{ fontFamily: "mono", fontWeight: "semibold", fontSize: "sm" }}
      >
        {stop}
      </Text>
      <Text css={{ fontFamily: "mono", fontSize: "xs" }}>
        {resolved ? toHex(resolved) : "…"}
      </Text>
      <Text css={{ fontFamily: "mono", fontSize: "xs", color: "gray.600" }}>
        {contrast ? `${contrast.toFixed(2)}:1` : ""}
      </Text>
    </VStack>
  );
};

// Every ramp is laid out over the same column set — the union of the stop
// names any of them uses — so a stop can be read down the stack and a ramp
// that doesn't define one leaves the column empty. Fixed-width columns, not
// fractional: a ramp missing a stop then reads as a gap in the ladder rather
// than as a row of wider swatches, and a ramp that wraps lines up with the
// ramp above it.
const allStops = [10, 50, 75, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900];

const Ramp = ({
  ramp,
  stops,
  caption,
}: {
  ramp: string;
  stops: number[];
  caption: string;
}) => (
  <VStack alignItems="stretch" gap={2}>
    <Text css={{ fontFamily: "mono", fontWeight: "semibold" }}>{ramp}</Text>
    <Text css={{ color: "gray.600", maxW: "42rem" }}>{caption}</Text>
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, 4.5rem)",
        gap: 2,
        alignItems: "start",
      }}
    >
      {allStops.map((stop) =>
        stops.includes(stop) ? (
          <Swatch key={stop} ramp={ramp} stop={stop} />
        ) : (
          <div key={stop} />
        ),
      )}
    </Box>
  </VStack>
);

export const Ramps: Story = {
  render: () => (
    <VStack alignItems="stretch" gap={10}>
      <Ramp
        ramp="gray"
        stops={[10, 50, 75, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900]}
        caption="The family neutrals, and the ladder the others are graded against. 400 (≥ 3:1) is the floor for a boundary that identifies a control, 500 (≥ 4.5:1) is text-safe, 350 is decorative fill only. 10–300 are surfaces and carry no contract — an app preset may re-tint them freely."
      />
      <Ramp
        ramp="red"
        stops={[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}
        caption="Errors/recording, not a brand colour. Aliased as danger."
      />
    </VStack>
  ),
};
