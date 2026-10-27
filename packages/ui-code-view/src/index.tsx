/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
/**
 * ui-code-view — read-only, syntax-highlighted code in the style of the
 * micro:bit editors. Styled by the package's plain stylesheet
 * (`@microbit/ui-code-view/style.css`), not Panda.
 */
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

// A private instance so an app's own highlight.js configuration (e.g. a
// classPrefix, which would break style.css) can't reach these components.
const highlighter = hljs.newInstance();
highlighter.registerLanguage("python", python);
highlighter.registerLanguage("typescript", typescript);

export interface CodeViewProps {
  code: string;
  /**
   * Added to the outermost element, e.g. to change the background. Any class
   * wins over the stylesheet's rules for that element, which are
   * zero-specificity, so stylesheet order and cascade layers don't matter.
   */
  className?: string;
}

type Variant = "python-editor" | "makecode-javascript";

/**
 * Ids in lang/ui.en.json. There's no inline English: apps compile this
 * package's catalogs, English included, into their own (see README).
 */
type LabelId =
  | "ui-code-view.python-label"
  | "ui-code-view.makecode-javascript-label";

/**
 * Whether the element currently scrolls sideways. Safari doesn't make scroll
 * containers keyboard-focusable, so a scrolling view needs a tabIndex to be
 * reachable without a mouse; one that fits stays out of the tab order.
 */
const useScrollsHorizontally = (
  ref: RefObject<HTMLElement | null>,
  content: string,
) => {
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => setScrolls(element.scrollWidth > element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    // A web font arriving changes the content's width but not the element's.
    let active = true;
    void document.fonts?.ready.then(() => active && update());
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [ref, content]);
  return scrolls;
};

const CodeView = ({
  code,
  className,
  language,
  variant,
  label,
}: CodeViewProps & {
  language: string;
  variant: Variant;
  label: LabelId;
}) => {
  const intl = useIntl();
  // A trailing newline ends the last line rather than starting another.
  const lineNumbers = code
    .replace(/\n$/, "")
    .split("\n")
    .map((_, i) => i + 1)
    .join("\n");
  // highlight.js escapes the source; its output contains only its own spans.
  const html = useMemo(
    () => highlighter.highlight(code, { language, ignoreIllegals: true }).value,
    [code, language],
  );
  const codeRef = useRef<HTMLPreElement>(null);
  const scrolls = useScrollsHorizontally(codeRef, html);
  // Browsers drop focus from an element that stops being focusable, so a
  // resize or zoom that ends the scrolling mustn't take the tabIndex away
  // until focus moves on.
  const [focused, setFocused] = useState(false);
  const focusable = scrolls || focused;
  // Line numbers are a separate column rather than a prefix on each line so
  // highlight.js's output never needs splitting: its spans for multi-line
  // strings and comments cross line breaks.
  return (
    // Code reads left to right whatever the page direction, and browser
    // translation would rewrite identifiers and comments.
    <div
      className={`mb-code-view mb-code-view--${variant}${className ? ` ${className}` : ""}`}
      dir="ltr"
      translate="no"
    >
      <pre className="mb-code-view__gutter" aria-hidden="true">
        {lineNumbers}
      </pre>
      {/* Once focusable it needs a name, which a pre (role generic) can't
          take; group rather than region keeps code out of the landmarks. */}
      <pre
        ref={codeRef}
        className="mb-code-view__code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...(focusable && {
          tabIndex: 0,
          role: "group",
          "aria-label": intl.formatMessage({ id: label }),
        })}
      >
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- escaped by highlight.js, see above */}
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
};

/** Python, styled like the micro:bit Python Editor. */
export const PythonEditorCodeView = (props: CodeViewProps) => (
  <CodeView
    {...props}
    language="python"
    variant="python-editor"
    label="ui-code-view.python-label"
  />
);

/** MakeCode's JavaScript (a TypeScript subset), styled like its code view. */
export const MakeCodeJavaScriptCodeView = (props: CodeViewProps) => (
  <CodeView
    {...props}
    language="typescript"
    variant="makecode-javascript"
    label="ui-code-view.makecode-javascript-label"
  />
);
