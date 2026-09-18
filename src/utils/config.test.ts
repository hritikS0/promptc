import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getApiKey, setApiKey, clearApiKey } from "./config.js";

describe("Config utility", () => {
  const originalEnv = process.env.NVIDIA_API_KEY;

  beforeEach(() => {
    delete process.env.NVIDIA_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NVIDIA_API_KEY = originalEnv;
    } else {
      delete process.env.NVIDIA_API_KEY;
    }
  });

  it("prioritizes process.env.NVIDIA_API_KEY over stored config", () => {
    setApiKey("stored-key-123");
    process.env.NVIDIA_API_KEY = "env-key-456";

    expect(getApiKey()).toBe("env-key-456");
  });

  it("falls back to stored config when env var is absent", () => {
    delete process.env.NVIDIA_API_KEY;
    setApiKey("stored-key-789");

    expect(getApiKey()).toBe("stored-key-789");
  });

  it("returns undefined when neither env nor config key is present", () => {
    delete process.env.NVIDIA_API_KEY;
    clearApiKey();

    expect(getApiKey()).toBeUndefined();
  });
});
