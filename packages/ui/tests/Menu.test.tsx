/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  Button,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  MenuTrigger,
} from "../src";

afterEach(cleanup);

const open = () =>
  fireEvent.click(screen.getByRole("button", { name: "Open" }));

const option = (name: string) =>
  screen.getByText(name).closest("[role]") as HTMLElement;

const attr = (name: string, key: string) => option(name).getAttribute(key);

it("renders a radio group as menuitemradio", () => {
  const onChange = vi.fn();
  render(
    <MenuTrigger>
      <Button>Open</Button>
      <MenuList>
        <MenuOptionGroup title="Sort by" value="name" onChange={onChange}>
          <MenuItemOption value="name">Name</MenuItemOption>
          <MenuItemOption value="size">Size</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </MenuTrigger>,
  );
  open();
  expect(attr("Name", "role")).toBe("menuitemradio");
  expect(attr("Name", "aria-checked")).toBe("true");
  expect(attr("Size", "aria-checked")).toBe("false");

  fireEvent.click(option("Size"));
  expect(onChange).toHaveBeenCalledWith("size");
});

it("renders a checkbox group as menuitemcheckbox and toggles independently", () => {
  const Probe = () => {
    const [shown, setShown] = useState<string[]>(["grid"]);
    return (
      <MenuTrigger>
        <Button>Open</Button>
        <MenuList>
          <MenuOptionGroup type="checkbox" value={shown} onChange={setShown}>
            <MenuItemOption value="grid">Grid</MenuItemOption>
            <MenuItemOption value="rulers">Rulers</MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </MenuTrigger>
    );
  };
  render(<Probe />);

  open();
  expect(attr("Grid", "role")).toBe("menuitemcheckbox");
  expect(attr("Grid", "aria-checked")).toBe("true");
  expect(attr("Rulers", "aria-checked")).toBe("false");
  // The check indicator is driven by data-selected, in this mode too.
  expect(attr("Grid", "data-selected")).not.toBeNull();

  // Checking an option leaves the menu open, as Chakra's checkbox groups did.
  fireEvent.click(option("Rulers"));
  expect(attr("Grid", "aria-checked")).toBe("true");
  expect(attr("Rulers", "aria-checked")).toBe("true");

  fireEvent.click(option("Grid"));
  expect(attr("Grid", "aria-checked")).toBe("false");
  expect(attr("Rulers", "aria-checked")).toBe("true");
});

it("fires an option's onAction on the press that unchecks it", () => {
  const onAction = vi.fn();
  const Probe = () => {
    const [on, setOn] = useState(true);
    return (
      <MenuTrigger>
        <Button>Open</Button>
        <MenuList>
          <MenuOptionGroup type="checkbox" value={on ? ["k"] : []}>
            <MenuItemOption
              value="k"
              onAction={() => {
                onAction();
                setOn((v) => !v);
              }}
            >
              Toggle
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </MenuTrigger>
    );
  };
  render(<Probe />);

  open();
  fireEvent.click(option("Toggle"));
  expect(attr("Toggle", "aria-checked")).toBe("false");
  fireEvent.click(option("Toggle"));
  expect(attr("Toggle", "aria-checked")).toBe("true");
  expect(onAction).toHaveBeenCalledTimes(2);
});

it("silently drops the rest of the collection after a non-collection child", () => {
  // Not desired behaviour — a regression guard for the trap itself, so that if
  // react-aria ever starts throwing or warning here we notice and can delete
  // the workarounds that hoist dialogs out of menus.
  render(
    <MenuTrigger>
      <Button>Open</Button>
      <MenuList>
        <MenuItem>First</MenuItem>
        <div>not a collection node</div>
        <MenuItem>Second</MenuItem>
      </MenuList>
    </MenuTrigger>,
  );
  open();
  expect(screen.queryAllByRole("menuitem").map((e) => e.textContent)).toEqual([
    "First",
  ]);
});
