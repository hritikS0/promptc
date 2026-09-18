import {z} from "zod";

export const PromptIRSchema = z.object({
  objective: z.string(),

  requirements: z.array(z.string()),

  constraints: z.array(z.string()),

  context: z.array(z.string()),

  assumptions: z.array(z.string()),

  ambiguities: z.array(z.string()),

  acceptanceCriteria: z.array(z.string()),
});
export type PromptIR = z.infer<typeof PromptIRSchema>;