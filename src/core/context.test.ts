import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  extractReferences,
  removeReferences,
  resolveReference,
  readReference,
  loadContext,
  formatContext,
} from "./context.js";

describe("readReference", () => {
  it("reads a referenced file", async () => {
    const content = await readReference("src/core/context.ts");

    expect(content).toContain("extractReferences");
  });

  it("rejects a reference outside the project", async () => {
    await expect(
      readReference("../../secret.txt"),
    ).rejects.toThrow("Reference is outside the project");
  });

  it("throws error if referenced file does not exist", async () => {
    await expect(
      readReference("src/core/nonexistent.ts"),
    ).rejects.toThrow("Referenced file not found: src/core/nonexistent.ts");
  });

  it("throws error if reference is a directory", async () => {
    await expect(readReference("src/core")).rejects.toThrow(
      "Reference is not a file: src/core",
    );
  });

  it("throws error if file extension is unsupported", async () => {
    await expect(readReference(".DS_Store")).rejects.toThrow(
      "Unsupported file type: .DS_Store",
    );
  });

  it("throws error if referenced file exceeds size limit", async () => {
    await expect(readReference("package-lock.json")).rejects.toThrow(
      "Referenced file is too large: package-lock.json",
    );
  });

  it("reads supported file types", async () => {
    const content = await readReference("package.json");
    expect(content).toContain("promptc");
  });
});

describe("extractReferences", () => {
  it("extracts a single file reference", () => {
    const result = extractReferences(
      "fix the login button @src/components/Login.tsx",
    );

    expect(result).toEqual(["src/components/Login.tsx"]);
  });

  it("extracts multiple references", () => {
    const result = extractReferences(
      "fix navbar @src/components/Navbar.tsx check @src/styles/navbar.css",
    );

    expect(result).toEqual([
      "src/components/Navbar.tsx",
      "src/styles/navbar.css",
    ]);
  });

  it("returns an empty array when there are no references", () => {
    const result = extractReferences("fix the login button");

    expect(result).toEqual([]);
  });

  it("extracts plain project file paths without @ prefix", () => {
    const result = extractReferences("fix context in src/core/context.ts");

    expect(result).toEqual(["src/core/context.ts"]);
  });
});

describe("removeReferences", () => {
  it("removes a single reference", () => {
    const result = removeReferences(
      "fix the login button @src/components/Login.tsx please",
    );

    expect(result).toBe("fix the login button please");
  });

  it("removes multiple references", () => {
    const result = removeReferences(
      "fix navbar @src/components/Navbar.tsx check @src/styles/navbar.css please",
    );

    expect(result).toBe("fix navbar check please");
  });

  it("cleans extra whitespace", () => {
    const result = removeReferences(
      "  fix   @src/components/Login.tsx   button  ",
    );

    expect(result).toBe("fix button");
  });

  it("leaves a prompt with no references unchanged", () => {
    const result = removeReferences("fix the login button");

    expect(result).toBe("fix the login button");
  });
});

describe("resolveReference", () => {
  it("resolves a path inside the project", () => {
    const result = resolveReference("src/core/context.ts");

    expect(result).toBe(
      path.resolve(process.cwd(), "src/core/context.ts"),
    );
  });

  it("rejects paths outside the project", () => {
    expect(() => resolveReference("../../secret.txt")).toThrow(
      "Reference is outside the project",
    );
  });
});

describe("loadContext", () => {
  it("loads multiple referenced files", async () => {
    const result = await loadContext(
      "check @src/core/compiler.ts and @package.json",
    );

    expect(result).toHaveLength(2);
    expect(result[0].path).toBe("src/core/compiler.ts");
    expect(result[0].content).toContain("compilePrompt");
    expect(result[1].path).toBe("package.json");
    expect(result[1].content).toContain("promptc");
  });

  it("returns [] with no references", async () => {
    const result = await loadContext("fix the login button");

    expect(result).toEqual([]);
  });

  it("deduplicates multiple references to the same file", async () => {
    const result = await loadContext(
      "check @src/core/compiler.ts and @./src/core/compiler.ts",
    );

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("src/core/compiler.ts");
  });
});

describe("formatContext", () => {
  it("formats file context correctly", () => {
    const context = [
      { path: "src/components/Login.tsx", content: "const Login = () => {};" },
      { path: "src/styles/login.css", content: ".login { color: blue; }" },
    ];

    const result = formatContext(context);

    expect(result).toBe(
      `### File: src/components/Login.tsx\n\n\`\`\`\nconst Login = () => {};\n\`\`\`\n\n### File: src/styles/login.css\n\n\`\`\`\n.login { color: blue; }\n\`\`\``,
    );
  });

  it("returns empty string when there is no context", () => {
    const result = formatContext([]);

    expect(result).toBe("");
  });
});