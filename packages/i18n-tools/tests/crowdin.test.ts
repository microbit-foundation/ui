/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { CrowdinProject } from "../src/crowdin.ts";

interface Listing {
  branchId?: number;
  directoryId?: number;
  filter?: string;
}

/**
 * A fake of the two listing calls, over a small tree:
 *   /apps (id 1) /apps/x (id 2) /packages (id 3), file ui.en.json (id 10) in /apps/x.
 * Records every listing so a test can see how much was asked for.
 */
const fakeClient = () => {
  const calls: { kind: string; options: Listing }[] = [];
  const directories = [
    { id: 1, directoryId: undefined, branchId: 7, name: "apps", path: "/apps" },
    { id: 2, directoryId: 1, branchId: 7, name: "x", path: "/apps/x" },
    {
      id: 3,
      directoryId: undefined,
      branchId: 7,
      name: "packages",
      path: "/packages",
    },
  ];
  const files = [
    { id: 10, directoryId: 2, name: "ui.en.json", path: "/apps/x/ui.en.json" },
  ];
  const api = {
    sourceFilesApi: {
      withFetchAll() {
        return this;
      },
      listProjectDirectories(_projectId: number, options: Listing) {
        calls.push({ kind: "directories", options });
        const data = directories
          .filter((d) =>
            options.directoryId !== undefined
              ? d.directoryId === options.directoryId
              : d.directoryId === undefined,
          )
          .filter((d) => !options.filter || d.name.includes(options.filter))
          .map((data) => ({ data }));
        return Promise.resolve({ data });
      },
      listProjectFiles(_projectId: number, options: Listing) {
        calls.push({ kind: "files", options });
        const data = files
          .filter((f) => f.directoryId === options.directoryId)
          .filter((f) => !options.filter || f.name.includes(options.filter))
          .map((data) => ({ data }));
        return Promise.resolve({ data });
      },
    },
  };
  return {
    api: api as unknown as Parameters<typeof CrowdinProject.withClient>[0],
    calls,
  };
};

const branch = { id: 7, name: "new" } as Parameters<
  typeof CrowdinProject.withClient
>[2];

describe("CrowdinProject lookups", () => {
  it("walks the directory chain with name filters rather than listing the branch", async () => {
    const { api, calls } = fakeClient();
    const project = CrowdinProject.withClient(api, 1, branch);
    const file = await project.findFile("apps/x/ui.en.json");
    expect(file?.id).toBe(10);
    expect(calls).toEqual([
      { kind: "directories", options: { branchId: 7, filter: "apps" } },
      { kind: "directories", options: { directoryId: 1, filter: "x" } },
      { kind: "files", options: { directoryId: 2, filter: "ui.en.json" } },
    ]);
  });

  it("caches directories across lookups and tolerates a branch prefix", async () => {
    const { api, calls } = fakeClient();
    const project = CrowdinProject.withClient(api, 1, branch);
    await project.findFile("new/apps/x/ui.en.json");
    await project.findFile("apps/x/other.json");
    expect(calls.filter((c) => c.kind === "directories")).toHaveLength(2);
  });

  it("returns undefined for a missing directory or file", async () => {
    const { api } = fakeClient();
    const project = CrowdinProject.withClient(api, 1, branch);
    expect(await project.findFile("apps/y/ui.en.json")).toBeUndefined();
    expect(await project.findFile("apps/x/missing.json")).toBeUndefined();
    await expect(project.requireDirectory("nowhere")).rejects.toThrow(
      /nowhere/,
    );
  });
});
