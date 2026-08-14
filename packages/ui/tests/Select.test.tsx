/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  act,
  cleanup,
  fireEvent,
  render as renderRaw,
  RenderOptions,
  screen,
} from "@testing-library/react";
import { ReactElement, ReactNode, useState } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, expect, it, vi } from "vitest";
import { ComboBox, Select, SelectOption } from "../src";
import { select } from "../src/Select.recipe";

afterEach(cleanup);

// Some components' built-in labels are react-intl messages (README
// "Strings"); English renders from defaultMessage, so no catalog is needed.
const render = (ui: ReactNode, options?: RenderOptions) =>
  renderRaw(ui, {
    wrapper: ({ children }) => (
      <IntlProvider locale="en">{children}</IntlProvider>
    ),
    ...options,
  });

const FRUIT = ["Apple", "Banana", "Cherry"];

const renderSelect = (props = {}) =>
  render(
    <Select aria-label="Fruit" placeholder="Pick one" {...props}>
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </Select>,
  );

it("shows the placeholder until something is chosen, then the choice", () => {
  const onSelectionChange = vi.fn();
  renderSelect({ onSelectionChange });
  const trigger = screen.getByRole("button");
  expect(trigger.textContent).toContain("Pick one");

  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("option", { name: "Banana" }));
  expect(onSelectionChange).toHaveBeenCalledWith("Banana");
  expect(screen.getByRole("button").textContent).toContain("Banana");
});

it("gives its options the parent's slot classes, so an app variant reaches them", () => {
  renderSelect();
  fireEvent.click(screen.getByRole("button"));
  for (const opt of screen.getAllByRole("option")) {
    expect(opt.className).toContain("select__option");
  }
});

it("ComboBox filters as you type and reports the selection", () => {
  const onSelectionChange = vi.fn();
  render(
    <ComboBox aria-label="Fruit" onSelectionChange={onSelectionChange}>
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </ComboBox>,
  );
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: "an" } });
  const names = screen.getAllByRole("option").map((o) => o.textContent);
  expect(names).toEqual(["Banana"]);

  fireEvent.click(screen.getByRole("option", { name: "Banana" }));
  expect(onSelectionChange).toHaveBeenCalledWith("Banana");
});

it("ComboBox can withhold the popover entirely", () => {
  const Probe = () => {
    const [q, setQ] = useState("");
    return (
      <ComboBox
        aria-label="Fruit"
        inputValue={q}
        onInputChange={setQ}
        // The gate classroom's name field uses: no list until 2 characters.
        isPopoverHidden={q.length < 2}
      >
        {FRUIT.map((f) => (
          <SelectOption key={f} id={f}>
            {f}
          </SelectOption>
        ))}
      </ComboBox>
    );
  };
  render(<Probe />);
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: "a" } });
  expect(screen.queryAllByRole("option")).toHaveLength(0);
  fireEvent.change(input, { target: { value: "ap" } });
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
    "Apple",
  ]);
});

it("ComboBox shows an empty state and can drop the indicator", () => {
  render(
    <ComboBox aria-label="Fruit" indicator={null} emptyState="Nothing found">
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </ComboBox>,
  );
  // indicator={null} means no toggle button beside the input.
  expect(screen.queryAllByRole("button")).toHaveLength(0);
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: "zzz" } });
  expect(screen.getByText("Nothing found")).toBeDefined();
});

/**
 * The trigger slot's rules, keyed by the border colour each one sets, so these
 * tests exercise the recipe's own selectors rather than copies of them. Panda's
 * `&` is the element the rule lands on, which is what `matches` compares
 * against.
 */
const triggerRules = () =>
  select.base?.trigger as Record<
    string,
    { borderColor?: string; focusRing?: string } | undefined
  >;

const ruleFor = (borderColor: string) => {
  const rules = triggerRules();
  const selector = Object.keys(rules).find(
    (k) => rules[k]?.borderColor === borderColor,
  );
  expect(selector).toBeDefined();
  return selector!;
};

// The focus rule carries the standard family ring, not a border tint.
const focusRule = () => {
  const rules = triggerRules();
  const selector = Object.keys(rules).find(
    (k) => rules[k]?.focusRing === "outline",
  );
  expect(selector).toBeDefined();
  return selector!;
};

/**
 * Fails if the focus rule goes back to keying off RAC's `data-focused`. That
 * attribute is unusable while a ComboBox's list is open: react-aria dispatches
 * a synthetic blur at the input when virtual focus moves to an option, so RAC
 * drops it even though real focus never left.
 */
const isTriggerFocusStyled = (el: Element) =>
  el.matches(focusRule().replaceAll("&", "*"));

/** Fails if the invalid rule goes back to a `data-invalid` RAC never sets. */
const isTriggerInvalidStyled = (el: Element) =>
  el.matches(ruleFor("danger.500").replaceAll("&", "*"));

it("ComboBox keeps its focus styling while an option is active", () => {
  render(
    <ComboBox
      aria-label="Fruit"
      // The shape of the stories that regressed: opening on focus with
      // something already chosen means an option is active from the first tab.
      menuTrigger="focus"
      defaultSelectedKey="Banana"
      defaultInputValue="Banana"
    >
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </ComboBox>,
  );
  const input = screen.getByRole("combobox") as HTMLInputElement;
  act(() => input.focus());
  expect(input.getAttribute("aria-expanded")).toBe("true");
  expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
  expect(input.getAttribute("data-focused")).toBeNull();

  expect(isTriggerFocusStyled(input.parentElement!)).toBe(true);
});

it("ComboBox keeps its focus styling across opening, choosing and reopening", () => {
  render(
    <ComboBox aria-label="Fruit">
      {FRUIT.map((f) => (
        <SelectOption key={f} id={f}>
          {f}
        </SelectOption>
      ))}
    </ComboBox>,
  );
  const input = screen.getByRole("combobox") as HTMLInputElement;
  const trigger = input.parentElement!;
  const toggle = screen.getByRole("button");
  act(() => input.focus());
  expect(isTriggerFocusStyled(trigger)).toBe(true);

  fireEvent.click(toggle);
  expect(isTriggerFocusStyled(trigger)).toBe(true);

  fireEvent.click(screen.getByRole("option", { name: "Cherry" }));
  expect(isTriggerFocusStyled(trigger)).toBe(true);

  // Reopening with a selection is the other way an option starts out active.
  fireEvent.click(toggle);
  expect(input.getAttribute("data-focused")).toBeNull();
  expect(isTriggerFocusStyled(trigger)).toBe(true);
});

it("Select's trigger takes focus styling from the keyboard only", () => {
  renderSelect();
  const trigger = screen.getByRole("button");
  act(() => trigger.focus());
  // RAC sets data-focused for either modality, so the recipe keys off
  // data-focus-visible; jsdom has no pointer, hence keyboard here.
  expect(trigger.getAttribute("data-focus-visible")).toBe("true");
  expect(isTriggerFocusStyled(trigger)).toBe(true);
  // The ComboBox arm must not reach a Select: no input inside the trigger.
  expect(trigger.matches(":has(input)")).toBe(false);
});

const invalidCases: [string, ReactElement][] = [
  [
    "Select",
    <Select aria-label="Fruit" isInvalid>
      <SelectOption id="a">Apple</SelectOption>
    </Select>,
  ],
  [
    "ComboBox",
    <ComboBox aria-label="Fruit" isInvalid>
      <SelectOption id="a">Apple</SelectOption>
    </ComboBox>,
  ],
];

it.each(invalidCases)(
  "an invalid %s paints its trigger from the root",
  (_name, control) => {
    const { container } = render(control);
    // RAC marks the root, not the trigger, which is why the rule reaches down.
    const root = container.querySelector('[class*="select__root"]')!;
    const trigger = container.querySelector('[class*="select__trigger"]')!;
    expect(root.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("data-invalid")).toBeNull();
    expect(isTriggerInvalidStyled(trigger)).toBe(true);
  },
);

it("a valid control is not painted red", () => {
  const { container } = render(
    <Select aria-label="Fruit">
      <SelectOption id="a">Apple</SelectOption>
    </Select>,
  );
  const trigger = container.querySelector('[class*="select__trigger"]')!;
  expect(isTriggerInvalidStyled(trigger)).toBe(false);
});

// jsdom applies no CSS, so the cascade can only be checked as declaration
// order: equal-specificity rules, so the last one wins. Red must beat hover
// (both set borderColor). The focus ring is an outline, disjoint from both,
// so invalid + focused compose (red border under the ring) rather than
// needing an order.
it("orders the trigger's state rules hover before invalid", () => {
  const keys = Object.keys(triggerRules());
  const hover = keys.indexOf(ruleFor("gray.500"));
  const invalid = keys.indexOf(ruleFor("danger.500"));
  expect(hover).toBeLessThan(invalid);
});

it("drops the chevron when asked, rather than silently keeping it", () => {
  const { container } = render(
    <Select aria-label="Fruit" indicator={null}>
      <SelectOption id="a">Apple</SelectOption>
    </Select>,
  );
  expect(container.querySelector('[class*="select__indicator"]')).toBeNull();
});
