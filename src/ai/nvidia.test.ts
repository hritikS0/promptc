import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { askNvidia } from "./nvidia.js";
import * as configModule from "../utils/config.js";

describe("askNvidia API key configuration", () => {
  const originalEnv = process.env.NVIDIA_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NVIDIA_API_KEY = originalEnv;
    } else {
      delete process.env.NVIDIA_API_KEY;
    }
  });

  it("throws clear error when NVIDIA_API_KEY is not configured", async () => {
    vi.spyOn(configModule, "getApiKey").mockReturnValue(undefined);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(askNvidia("test prompt")).rejects.toThrow(
      "NVIDIA_API_KEY is not configured.",
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls NVIDIA API with Authorization header when key is provided", async () => {
    vi.spyOn(configModule, "getApiKey").mockReturnValue("test-api-key");

    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                objective: "Test objective",
                requirements: [],
                constraints: [],
                context: [],
                assumptions: [],
                ambiguities: [],
                acceptanceCriteria: [],
              }),
            },
          },
        ],
      }),
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockResponse as Response);

    const result = await askNvidia("test prompt");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
        }),
      }),
    );
    expect(result.objective).toBe("Test objective");
  });
});
