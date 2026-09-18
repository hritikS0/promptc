import { z } from "zod";

export const PromptSchema = z.string().trim().min(1);

export type Prompt = z.infer<typeof PromptSchema>;