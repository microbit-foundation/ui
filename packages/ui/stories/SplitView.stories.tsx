/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReactNode, useState } from "react";
import {
  Box,
  Button,
  HStack,
  SplitView,
  SplitViewMode,
  SplitViewPane,
  SplitViewSplitter,
  Stack,
  Text,
} from "../src";

const meta = {
  title: "Layout/SplitView",
  component: SplitView,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SplitView>;
export default meta;

type Story = StoryObj<typeof meta>;

// Selectable text in both panes: a drag of the splitter across it must not
// select any.
const Prose = ({ heading }: { heading: string }) => (
  <Stack gap={3} p={4}>
    <Text fontWeight="semibold">{heading}</Text>
    {Array.from({ length: 4 }, (_, i) => (
      <Text key={i}>
        The micro:bit is a pocket-sized computer that introduces you to how
        software and hardware work together. It has an LED light display,
        buttons, sensors and many input/output features that, when programmed,
        let it interact with you and your world.
      </Text>
    ))}
  </Stack>
);

const Frame = ({ children }: { children: ReactNode }) => (
  <Box h="100vh" display="flex" flexDirection="column">
    {children}
  </Box>
);

const ModeButtons = ({
  mode,
  onChange,
}: {
  mode: SplitViewMode;
  onChange: (mode: SplitViewMode) => void;
}) => (
  <HStack gap={2} p={2} borderBottomWidth="1px" borderColor="gray.200">
    {(["open", "compact", "collapsed"] as const).map((m) => (
      <Button
        key={m}
        size="sm"
        variant={mode === m ? "primary" : "secondary"}
        onPress={() => onChange(m)}
      >
        {m}
      </Button>
    ))}
  </HStack>
);

/**
 * Panes side by side, with a sidebar as the primary pane. Tab to the
 * splitter and use the arrow keys, Home and End; the `mode` buttons show
 * the compact and collapsed states.
 */
export const VerticalSplitter: Story = {
  args: { children: null },
  render: () => {
    const [mode, setMode] = useState<SplitViewMode>("open");
    return (
      <Frame>
        <ModeButtons mode={mode} onChange={setMode} />
        <SplitView
          mode={mode}
          compactSize={64}
          defaultSize={320}
          primaryMinSize={200}
          primaryMaxSize={600}
          secondaryMinSize={300}
          css={{ flex: "1", minHeight: 0 }}
        >
          <SplitViewPane primary css={{ overflowY: "auto", bg: "gray.50" }}>
            {mode === "compact" ? null : <Prose heading="Sidebar" />}
          </SplitViewPane>
          <SplitViewSplitter aria-label="Resize sidebar" />
          <SplitViewPane css={{ overflowY: "auto" }}>
            <Prose heading="Main content" />
          </SplitViewPane>
        </SplitView>
      </Frame>
    );
  },
};

/** Stacked panes, primary at the bottom, like a serial terminal. */
export const HorizontalSplitter: Story = {
  args: { children: null },
  render: () => {
    const [mode, setMode] = useState<SplitViewMode>("open");
    return (
      <Frame>
        <ModeButtons mode={mode} onChange={setMode} />
        <SplitView
          orientation="horizontal"
          mode={mode}
          compactSize={48}
          defaultSize={200}
          primaryMinSize={120}
          secondaryMinSize={200}
          css={{ flex: "1", minHeight: 0 }}
        >
          <SplitViewPane css={{ overflowY: "auto" }}>
            <Prose heading="Editor" />
          </SplitViewPane>
          <SplitViewSplitter aria-label="Resize serial terminal" />
          <SplitViewPane
            primary
            css={{ overflowY: "auto", bg: "gray.800", color: "white" }}
          >
            <Text p={3} fontFamily="mono">
              Serial output
            </Text>
          </SplitViewPane>
        </SplitView>
      </Frame>
    );
  },
};

/**
 * The primary pane at the end, holding an iframe: a drag that crosses the
 * iframe must keep tracking the pointer.
 */
export const PrimaryAtEndWithIframe: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <SplitView
        defaultSize={360}
        primaryMinSize={240}
        secondaryMinSize={300}
        css={{ flex: "1", minHeight: 0 }}
      >
        <SplitViewPane css={{ overflowY: "auto" }}>
          <Prose heading="Editor" />
        </SplitViewPane>
        <SplitViewSplitter aria-label="Resize simulator" />
        <SplitViewPane primary>
          <iframe
            title="Embedded page"
            srcDoc="<body style='font-family:sans-serif;background:#eee'><p>An iframe pane.</p></body>"
            style={{ border: 0, width: "100%", height: "100%" }}
          />
        </SplitViewPane>
      </SplitView>
    </Frame>
  ),
};

/**
 * An iframe beside the SplitView rather than in it: drag the splitter right,
 * over the iframe, then back. The drag must keep tracking the pointer and
 * end on release over the iframe.
 */
export const IframeOutside: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <HStack gap={0} flex="1" minHeight={0} alignItems="stretch">
        <SplitView
          defaultSize={240}
          primaryMinSize={160}
          css={{ flex: "1", minWidth: 0 }}
        >
          <SplitViewPane primary css={{ overflowY: "auto", bg: "gray.50" }}>
            <Prose heading="Sidebar" />
          </SplitViewPane>
          <SplitViewSplitter aria-label="Resize sidebar" />
          <SplitViewPane css={{ overflowY: "auto" }}>
            <Prose heading="Main content" />
          </SplitViewPane>
        </SplitView>
        <iframe
          title="Embedded page"
          srcDoc="<body style='font-family:sans-serif;background:#eee'><p>An iframe outside the SplitView.</p></body>"
          style={{ border: 0, width: "40%", flex: "none" }}
        />
      </HStack>
    </Frame>
  ),
};

/**
 * Controlled size, persisted by the app: reload the story and the size is
 * kept. `onSizeChangeEnd` fires once per drag or key press.
 */
export const Persisted: Story = {
  args: { children: null },
  render: () => {
    const key = "storybook-splitview-size";
    const [size, setSize] = useState(() => {
      try {
        return Number(localStorage.getItem(key)) || 300;
      } catch {
        return 300;
      }
    });
    const [saves, setSaves] = useState(0);
    return (
      <Frame>
        <SplitView
          size={size}
          onSizeChange={setSize}
          onSizeChangeEnd={(s) => {
            try {
              localStorage.setItem(key, String(s));
            } catch {
              // Storage unavailable; the size just isn't kept.
            }
            setSaves((n) => n + 1);
          }}
          primaryMinSize={200}
          secondaryMinSize={300}
          css={{ flex: "1", minHeight: 0 }}
        >
          <SplitViewPane primary css={{ bg: "gray.50" }}>
            <Stack p={4} gap={2}>
              <Text>Size: {size}px</Text>
              <Text>Saves: {saves}</Text>
            </Stack>
          </SplitViewPane>
          <SplitViewSplitter aria-label="Resize sidebar" />
          <SplitViewPane>
            <Prose heading="Main content" />
          </SplitViewPane>
        </SplitView>
      </Frame>
    );
  },
};

/** The splitter restyled per app, here as the Python Editor draws it. */
export const RestyledSplitter: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <SplitView
        defaultSize={320}
        primaryMinSize={200}
        secondaryMinSize={300}
        css={{ flex: "1", minHeight: 0 }}
      >
        <SplitViewPane primary css={{ overflowY: "auto" }}>
          <Prose heading="Sidebar" />
        </SplitViewPane>
        <SplitViewSplitter
          aria-label="Resize sidebar"
          css={{
            bg: "#eaecf1",
            color: "brand.500",
            boxShadow: "md",
            _hover: { bg: "#dcdfe6" },
            _active: { bg: "#d0d4dd" },
          }}
        />
        <SplitViewPane css={{ overflowY: "auto" }}>
          <Prose heading="Main content" />
        </SplitViewPane>
      </SplitView>
    </Frame>
  ),
};
