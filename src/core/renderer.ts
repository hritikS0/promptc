import type { PromptIR } from "../schemas/prompt-ir.js";

function renderList(title: string, items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  return `## ${title}

${items.map((item) => `- ${item}`).join("\n")}`;
}

export function renderPrompt(ir: PromptIR): string {
  return [
    `## Objective\n\n${ir.objective}`,
    renderList("Requirements", ir.requirements),
    renderList("Constraints", ir.constraints),
    renderList("Context", ir.context),
    renderList("Assumptions", ir.assumptions),
    renderList("Ambiguities", ir.ambiguities),
    renderList("Acceptance Criteria", ir.acceptanceCriteria),
  ]
    .filter(Boolean)
    .join("\n\n");
}