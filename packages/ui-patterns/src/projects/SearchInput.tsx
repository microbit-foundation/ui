/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Icon,
  IconButton,
  Input,
  InputEndElement,
  InputGroup,
  InputStartElement,
} from "@microbit/ui";
import { useCallback, useRef } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { uiPatternsMessage } from "../messages";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name and placeholder. Defaults to "Search". */
  label?: string;
  className?: string;
}

/**
 * A rounded search box with a leading icon and a clear button while there
 * is text. Clearing returns focus to the box.
 */
export const SearchInput = ({
  value,
  onChange,
  label,
  className,
}: SearchInputProps) => {
  const intl = useIntl();
  const ref = useRef<HTMLInputElement>(null);
  const text =
    label ?? intl.formatMessage(uiPatternsMessage("ui-patterns.search"));
  const handleClear = useCallback(() => {
    onChange("");
    ref.current?.focus();
  }, [onChange]);
  return (
    <InputGroup className={className}>
      <InputStartElement pointerEvents="none">
        <Icon as={RiSearch2Line} css={{ color: "gray.800" }} />
      </InputStartElement>
      <Input
        ref={ref}
        aria-label={text}
        placeholder={text}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="search"
        css={{
          // We draw our own clear button.
          appearance: "none",
          "&::-webkit-search-cancel-button": { display: "none" },
          ps: 10,
          pe: 10,
          fontSize: "lg",
          _placeholder: { color: "gray.500" },
          borderRadius: "20px",
          background: "white",
        }}
      />
      {value && (
        <InputEndElement>
          <IconButton
            variant="ghost"
            aria-label={intl.formatMessage(
              uiPatternsMessage("ui-patterns.clear-action"),
            )}
            onPress={handleClear}
            css={{ fontSize: "2xl", color: "gray.500" }}
          >
            <Icon as={RiCloseLine} />
          </IconButton>
        </InputEndElement>
      )}
    </InputGroup>
  );
};
