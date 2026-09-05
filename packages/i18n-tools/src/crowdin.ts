/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import crowdinClient, {
  type SourceFilesModel,
  type TranslationStatusModel,
} from "@crowdin/crowdin-api-client";
import { unzipSync } from "fflate";
import type { CrowdinConfig } from "./index.ts";

// The client is CommonJS; under ESM its default import is the module object.
const Crowdin = crowdinClient.default;
type Client = InstanceType<typeof Crowdin>;

export const tokenEnvVar = "CROWDIN_PERSONAL_TOKEN";

export const requireToken = (): string => {
  const token = process.env[tokenEnvVar];
  if (!token) {
    throw new Error(
      `Set ${tokenEnvVar} to a Crowdin personal access token with access to the project`,
    );
  }
  return token;
};

// Generous: listing the whole microbit.org project is a few thousand files.
const fetchAllLimit = 10000;

export interface DownloadOptions {
  approvedOnly?: boolean;
  skipUntranslated?: boolean;
}

const fetchOk = async (url: string): Promise<Response> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }
  return response;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One Crowdin project, seen from a branch: resolves the paths in our config
 * to Crowdin's numeric ids and wraps the handful of API calls we make.
 */
export class CrowdinProject {
  private files?: SourceFilesModel.File[];
  private directories?: SourceFilesModel.Directory[];
  private readonly api: Client;
  readonly projectId: number;
  private readonly branch: SourceFilesModel.Branch | undefined;

  private constructor(
    api: Client,
    projectId: number,
    branch: SourceFilesModel.Branch | undefined,
  ) {
    this.api = api;
    this.projectId = projectId;
    this.branch = branch;
  }

  static async connect(
    config: CrowdinConfig,
    token: string,
  ): Promise<CrowdinProject> {
    const api = new Crowdin({ token });
    let projectId: number;
    if (typeof config.project === "number") {
      projectId = config.project;
    } else {
      const projects = await api.projectsGroupsApi
        .withFetchAll(fetchAllLimit)
        .listProjects();
      const match = projects.data.find(
        (p) => p.data.identifier === config.project,
      );
      if (!match) {
        throw new Error(
          `No Crowdin project with identifier ${config.project} is visible to this token`,
        );
      }
      projectId = match.data.id;
    }
    let branch: SourceFilesModel.Branch | undefined;
    if (config.branch) {
      const branches = await api.sourceFilesApi.listProjectBranches(projectId, {
        name: config.branch,
      });
      branch = branches.data
        .map((b) => b.data)
        .find((b) => b.name === config.branch);
      if (!branch) {
        throw new Error(
          `No branch ${config.branch} in Crowdin project ${projectId}`,
        );
      }
    }
    return new CrowdinProject(api, projectId, branch);
  }

  /** A Crowdin path made relative to the branch, without a leading slash. */
  private relative(crowdinPath: string): string {
    let p = crowdinPath.replace(/^\/+/, "");
    if (this.branch && p.startsWith(this.branch.name + "/")) {
      p = p.slice(this.branch.name.length + 1);
    }
    return p.replace(/\/+$/, "");
  }

  private async listFiles(): Promise<SourceFilesModel.File[]> {
    if (!this.files) {
      const response = await this.api.sourceFilesApi
        .withFetchAll(fetchAllLimit)
        .listProjectFiles(this.projectId, {
          branchId: this.branch?.id,
          recursion: "true",
        });
      this.files = response.data.map((f) => f.data);
    }
    return this.files;
  }

  private async listDirectories(): Promise<SourceFilesModel.Directory[]> {
    if (!this.directories) {
      const response = await this.api.sourceFilesApi
        .withFetchAll(fetchAllLimit)
        .listProjectDirectories(this.projectId, {
          branchId: this.branch?.id,
          recursion: "true",
        });
      this.directories = response.data.map((d) => d.data);
    }
    return this.directories;
  }

  /** @param crowdinPath relative to the branch root, e.g. `apps/x/ui.en.json`. */
  async findFile(
    crowdinPath: string,
  ): Promise<SourceFilesModel.File | undefined> {
    const wanted = this.relative(crowdinPath);
    return (await this.listFiles()).find(
      (f) => this.relative(f.path) === wanted,
    );
  }

  async requireFile(crowdinPath: string): Promise<SourceFilesModel.File> {
    const file = await this.findFile(crowdinPath);
    if (!file) {
      throw new Error(
        `No file ${crowdinPath} in Crowdin${this.branch ? ` branch ${this.branch.name}` : ""}`,
      );
    }
    return file;
  }

  async findDirectory(
    crowdinPath: string,
  ): Promise<SourceFilesModel.Directory | undefined> {
    const wanted = this.relative(crowdinPath);
    return (await this.listDirectories()).find(
      (d) => this.relative(d.path) === wanted,
    );
  }

  async requireDirectory(
    crowdinPath: string,
  ): Promise<SourceFilesModel.Directory> {
    const directory = await this.findDirectory(crowdinPath);
    if (!directory) {
      throw new Error(
        `No directory ${crowdinPath} in Crowdin${this.branch ? ` branch ${this.branch.name}` : ""}`,
      );
    }
    return directory;
  }

  /** The current English source of a file, as text. */
  async downloadSource(file: SourceFilesModel.File): Promise<string> {
    const link = await this.api.sourceFilesApi.downloadFile(
      this.projectId,
      file.id,
    );
    return (await fetchOk(link.data.url)).text();
  }

  /**
   * One file's translation into one language, built on demand: no project
   * build, no zip.
   */
  async downloadTranslation(
    file: SourceFilesModel.File,
    languageId: string,
    { approvedOnly = false, skipUntranslated = true }: DownloadOptions = {},
  ): Promise<string> {
    const built = await this.api.translationsApi.buildProjectFileTranslation(
      this.projectId,
      file.id,
      {
        targetLanguageId: languageId,
        skipUntranslatedStrings: skipUntranslated,
        exportApprovedOnly: approvedOnly,
      },
    );
    return (await fetchOk(built.data.url)).text();
  }

  /**
   * A directory's translation into one language as a map of paths (relative
   * to the directory) to file contents.
   */
  async downloadDirectoryTranslation(
    directory: SourceFilesModel.Directory,
    languageId: string,
    { approvedOnly = false, skipUntranslated = true }: DownloadOptions = {},
  ): Promise<Map<string, Uint8Array>> {
    const started =
      await this.api.translationsApi.buildProjectDirectoryTranslation(
        this.projectId,
        directory.id,
        {
          targetLanguageIds: [languageId],
          skipUntranslatedStrings: skipUntranslated,
          exportApprovedOnly: approvedOnly,
          preserveFolderHierarchy: true,
        },
      );
    // Crowdin answers with a download link when a matching build already
    // exists and a build to poll otherwise.
    let url: string | undefined = (started.data as { url?: string }).url;
    if (!url) {
      const buildId = started.data.id;
      for (let attempt = 0; attempt < 120; attempt++) {
        const status = await this.api.translationsApi.checkBuildStatus(
          this.projectId,
          buildId,
        );
        if (status.data.status === "finished") {
          break;
        }
        if (
          status.data.status === "failed" ||
          status.data.status === "canceled"
        ) {
          throw new Error(`Crowdin build ${buildId} ${status.data.status}`);
        }
        await sleep(1000);
      }
      url = (
        await this.api.translationsApi.downloadTranslations(
          this.projectId,
          buildId,
        )
      ).data.url;
    }
    const zip = new Uint8Array(await (await fetchOk(url)).arrayBuffer());
    const result = new Map<string, Uint8Array>();
    // The zip preserves Crowdin's hierarchy; keep what's below our directory.
    const prefix = this.relative(directory.path) + "/";
    for (const [entry, data] of Object.entries(unzipSync(zip))) {
      if (entry.endsWith("/")) {
        continue;
      }
      const normalized = entry.replace(/^\/+/, "");
      const index = normalized.indexOf(prefix);
      result.set(
        index >= 0 ? normalized.slice(index + prefix.length) : normalized,
        data,
      );
    }
    return result;
  }

  /**
   * Replaces a file's English source (or adds the file to a directory).
   * `keepTranslations` keeps existing translations for strings whose text
   * changed, for corrections translators need not see.
   */
  async uploadSource(
    directoryPath: string,
    name: string,
    content: string,
    { keepTranslations = false }: { keepTranslations?: boolean } = {},
  ): Promise<SourceFilesModel.File> {
    const existing = await this.findFile(`${directoryPath}/${name}`);
    const storage = await this.api.uploadStorageApi.addStorage(
      name,
      content,
      "application/octet-stream",
    );
    if (existing) {
      const updated = await this.api.sourceFilesApi.updateOrRestoreFile(
        this.projectId,
        existing.id,
        {
          storageId: storage.data.id,
          updateOption: keepTranslations
            ? "keep_translations_and_approvals"
            : "clear_translations_and_approvals",
        },
      );
      return updated.data;
    }
    const directory = await this.requireDirectory(directoryPath);
    const created = await this.api.sourceFilesApi.createFile(this.projectId, {
      storageId: storage.data.id,
      name,
      directoryId: directory.id,
    });
    this.files = undefined;
    return created.data;
  }

  async fileProgress(
    file: SourceFilesModel.File,
  ): Promise<TranslationStatusModel.LanguageProgress[]> {
    const response = await this.api.translationStatusApi
      .withFetchAll(fetchAllLimit)
      .getFileProgress(this.projectId, file.id);
    return response.data.map((p) => p.data);
  }
}

/** A readable rendering of a Crowdin API error, which otherwise hides the detail. */
export const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    const apiError = (error as { apiError?: unknown }).apiError;
    return apiError
      ? `${error.message}\n${JSON.stringify(apiError, null, 2)}`
      : error.message;
  }
  return String(error);
};
