import { describe, expect, it } from "vitest";
import { renderPrompt } from "./renderer.js";

describe("renderPrompt", () => {
  it("renders a PromptIR into a structured prompt", () => {
    const ir = {
      objective: "Make the login button blue.",
      requirements: ["Change the login button color to blue."],
      constraints: ["Keep existing functionality unchanged."],
      context: [],
      assumptions: [],
      ambiguities: ["The exact shade of blue is not specified."],
      acceptanceCriteria: ["The login button appears blue."],
    };

    const result = renderPrompt(ir);

    expect(result).toContain("## Objective");
    expect(result).toContain("Make the login button blue.");
    expect(result).toContain("## Requirements");
    expect(result).toContain("- Change the login button color to blue.");
    expect(result).toContain("## Constraints");
    expect(result).toContain("## Ambiguities");
    expect(result).toContain("The exact shade of blue is not specified.");
    expect(result).toContain("## Acceptance Criteria");
  });
  it("omits empty sections", () => {
  const ir = {
    objective: "Make the login button blue.",
    requirements: ["Change the login button color to blue."],
    constraints: [],
    context: [],
    assumptions: [],
    ambiguities: [],
    acceptanceCriteria: ["The login button appears blue."],
  };

  const result = renderPrompt(ir);

  expect(result).not.toContain("## Constraints");
  expect(result).not.toContain("## Context");
  expect(result).not.toContain("## Assumptions");
  expect(result).not.toContain("## Ambiguities");
});
});