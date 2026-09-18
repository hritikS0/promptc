import { askNvidia } from "../ai/nvidia.js";
import { renderPrompt } from "./renderer.js";
import { loadContext, removeReferences, formatContext } from "./context.js";

export async function compilePrompt(prompt: string) {
  const contextFiles = await loadContext(prompt);
  const cleanPrompt = removeReferences(prompt);
  const formattedContext = formatContext(contextFiles);

  const ir = await askNvidia(cleanPrompt, formattedContext);
  const renderedPrompt = renderPrompt(ir);

  return {
    ir,
    renderedPrompt,
  };
}