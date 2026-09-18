import { describe, expect, it } from "vitest";
import { PromptIRSchema } from "./prompt-ir.js";

describe("PromptIRSchema", () => {
  it("accepts a valid PromptIR", () => {
    const ir = {
      objective: "Make the login button blue.",
      requirements: ["Change the login button color to blue."],
      constraints: ["Keep existing functionality unchanged."],
      context: [],
      assumptions: [],
      ambiguities: [],
      acceptanceCriteria: ["The login button appears blue."],
    };

    const result = PromptIRSchema.safeParse(ir);

    expect(result.success).toBe(true);
  });

  it("rejects an invalid PromptIR", () => {
    const ir = {
      objective: "Make the login button blue.",
      requirements: "Change the login button color to blue.",
      constraints: [],
      context: [],
      assumptions: [],
      ambiguities: [],
      acceptanceCriteria: [],
    };

    const result = PromptIRSchema.safeParse(ir);

    expect(result.success).toBe(false);
  });
});