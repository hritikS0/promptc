import { describe, expect, it, vi } from "vitest";
import { compilePrompt } from "./compiler.js";
import { askNvidia } from "../ai/nvidia.js";

vi.mock("../ai/nvidia.js", () => ({
  askNvidia: vi.fn(),
}));

describe("compilePrompt", () => {
  it("compiles a raw prompt into IR and a rendered prompt", async () => {
    vi.mocked(askNvidia).mockResolvedValue({
      objective: "Make the login button blue.",
      requirements: ["Change the login button color to blue."],
      constraints: ["Keep existing functionality unchanged."],
      context: [],
      assumptions: [],
      ambiguities: [],
      acceptanceCriteria: ["The login button appears blue."],
    });

    const result = await compilePrompt("make the login button blue");

    expect(result.ir.objective).toBe("Make the login button blue.");

    expect(result.renderedPrompt).toContain("## Objective");
    expect(result.renderedPrompt).toContain(
      "- Change the login button color to blue.",
    );
    expect(askNvidia).toHaveBeenCalledWith("make the login button blue", "");
  });

  it("passes cleaned prompt and formatted file context to askNvidia", async () => {
    vi.mocked(askNvidia).mockResolvedValue({
      objective: "Update package details.",
      requirements: [],
      constraints: [],
      context: [],
      assumptions: [],
      ambiguities: [],
      acceptanceCriteria: [],
    });

    await compilePrompt("check @package.json details");

    expect(askNvidia).toHaveBeenCalledWith(
      "check details",
      expect.stringContaining("### File: package.json"),
    );
  });

  it("propagates errors from the AI layer", async () => {
    vi.mocked(askNvidia).mockRejectedValue(
      new Error("NVIDIA API request failed"),
    );

    await expect(
      compilePrompt("make the login button blue"),
    ).rejects.toThrow("NVIDIA API request failed");
  });
});