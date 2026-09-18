import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";

export type FileContext = {
  path: string;
  content: string;
};

const MAX_FILE_SIZE = 100 * 1024;

const TEXT_FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".scss",
  ".html",
  ".md",
  ".txt",
  ".yml",
  ".yaml",
  ".env",
]);

export async function loadContext(prompt: string): Promise<FileContext[]> {
  const references = extractReferences(prompt);
  const seenPaths = new Set<string>();
  const uniqueReferences: string[] = [];

  for (const ref of references) {
    try {
      const resolved = resolveReference(ref);
      if (!seenPaths.has(resolved)) {
        seenPaths.add(resolved);
        uniqueReferences.push(ref);
      }
    } catch {
      if (!uniqueReferences.includes(ref)) {
        uniqueReferences.push(ref);
      }
    }
  }

  return Promise.all(
    uniqueReferences.map(async (reference) => ({
      path: reference,
      content: await readReference(reference),
    })),
  );
}

export function formatContext(context: FileContext[]): string {
  if (context.length === 0) {
    return "";
  }

  return context
    .map(
      (file) =>
        `### File: ${file.path}\n\n\`\`\`\n${file.content}\n\`\`\``,
    )
    .join("\n\n");
}

export function resolveReference(reference: string): string {
  const projectRoot = process.cwd();
  const resolvedPath = path.resolve(projectRoot, reference);

  const relativePath = path.relative(projectRoot, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Reference is outside the project: ${reference}`);
  }

  return resolvedPath;
}

export async function readReference(reference: string): Promise<string> {
  const resolvedPath = resolveReference(reference);

  let info;
  try {
    info = await stat(resolvedPath);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new Error(`Referenced file not found: ${reference}`);
    }

    throw error;
  }

  if (!info.isFile()) {
    throw new Error(`Reference is not a file: ${reference}`);
  }

  if (info.size > MAX_FILE_SIZE) {
    throw new Error(`Referenced file is too large: ${reference}`);
  }

  let ext = path.extname(reference).toLowerCase();
  if (!ext && path.basename(reference).toLowerCase() === ".env") {
    ext = ".env";
  }

  if (!TEXT_FILE_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported file type: ${reference}`);
  }

  return await readFile(resolvedPath, "utf8");
}

export function extractReferences(prompt: string): string[] {
  const references: string[] = [];

  const matches = prompt.match(/@([^\s]+)/g);
  if (matches) {
    matches.forEach((match) => {
      const ref = match.slice(1);
      if (!references.includes(ref)) {
        references.push(ref);
      }
    });
  }

  const tokens = prompt.split(/\s+/);
  for (const token of tokens) {
    if (token.startsWith("@")) continue;
    if (token.includes("/") || token.includes(".")) {
      try {
        const resolved = resolveReference(token);
        if (existsSync(resolved) && statSync(resolved).isFile()) {
          if (!references.includes(token)) {
            references.push(token);
          }
        }
      } catch {
        // Ignore invalid paths or paths outside project
      }
    }
  }

  return references;
}

export function removeReferences(prompt: string): string {
  const refs = extractReferences(prompt);
  let cleaned = prompt.replace(/@([^\s]+)/g, "");

  const words = cleaned.split(/\s+/);
  const remaining = words.filter((word) => !refs.includes(word));

  return remaining.join(" ").trim();
}