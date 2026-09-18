import { describe, expect, it } from "vitest";
import { PromptSchema } from "./prompt.js";

describe("PromptSchema", () => {
  it("accepts a non-empty prompt", () => {
    const result = PromptSchema.safeParse("fix the navbar");

    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = PromptSchema.safeParse("   fix the navbar   ");

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toBe("fix the navbar");
    }
  });

  it("rejects an empty prompt", () => {
    const result = PromptSchema.safeParse("");

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only prompt", () => {
    const result = PromptSchema.safeParse("   ");

    expect(result.success).toBe(false);
  });
});