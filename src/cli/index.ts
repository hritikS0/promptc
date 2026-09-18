import "dotenv/config";
import { compilePrompt } from "../core/compiler.js";
import { extractReferences } from "../core/context.js";
import { Command } from "commander";
import { PromptSchema } from "../schemas/prompt.js";
import { setApiKey } from "../utils/config.js";
import chalk from "chalk";
import ora from "ora";
import { input } from "@inquirer/prompts";
import clipboard from "clipboardy";

const program = new Command();

program
  .name("promptc")
  .description(
    "CLI tool for turning raw developer prompts into structured AI instructions",
  )
  .option("--json", "Output the PromptIR as JSON")
  .option("-c, --copy", "Copy compiled prompt to clipboard (default)", true)
  .option("--no-copy", "Disable copying compiled prompt to clipboard")
  .option("--set-key <key>", "Configure persistent NVIDIA API key")
  .version("1.0.2")
  .argument("[prompt...]", "Raw developer prompt");

program.parse();

function printHeader() {
  console.log(
    `${chalk.bold.cyan("promptc")} ${chalk.dim("Prompt Compiler")}\n`,
  );
}

async function main() {
  const options = program.opts();
  const isJson = Boolean(options.json);

  if (options.setKey) {
    setApiKey(options.setKey);
    if (!isJson) {
      console.log(
        `${chalk.green("✔")} NVIDIA API key saved to persistent configuration.`,
      );
    }
    process.exit(0);
  }

  let rawInput = program.args.join(" ");

  if (!rawInput.trim()) {
    if (isJson) {
      throw new Error("Prompt cannot be empty.");
    }

    printHeader();

    rawInput = await input({
      message: "Enter your prompt:",
    });
  } else if (!isJson) {
    printHeader();
  }

  const parsedPrompt = PromptSchema.safeParse(rawInput.trim());

  if (!parsedPrompt.success) {
    throw new Error("Prompt cannot be empty.");
  }

  const promptText = parsedPrompt.data;

  if (!isJson) {
    const references = extractReferences(promptText);
    if (references.length > 0) {
      const countLabel =
        references.length === 1
          ? "1 reference file"
          : `${references.length} reference files`;
      console.log(`${chalk.green("✔")} Loaded ${countLabel}`);
    }
  }

  let spinner: ReturnType<typeof ora> | null = null;

  if (!isJson) {
    spinner = ora({
      text: "Compiling prompt...",
      color: "cyan",
    }).start();
  }

  let result;
  try {
    result = await compilePrompt(promptText);
    if (spinner) {
      spinner.succeed("Prompt compiled");
    }
  } catch (error) {
    if (spinner) {
      spinner.stop();
    }
    throw error;
  }

  if (isJson) {
    console.log(JSON.stringify(result.ir, null, 2));
    process.exit(0);
  }

  if (options.copy !== false) {
    try {
      await clipboard.write(result.renderedPrompt);
      console.log(`${chalk.green("✔")} Copied compiled prompt to clipboard!`);
    } catch {
      // Fallback silently if clipboard unavailable
    }
  }

  console.log(chalk.bold.cyan("\nFinal prompt:\n"));
  console.log(result.renderedPrompt);
}

main().catch((error) => {
  const isJson = Boolean(program.opts().json);
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  if (isJson) {
    console.error(chalk.red(`✖ ${message}`));
  } else {
    console.error(`\n${chalk.red("✖")} ${chalk.red(message)}`);
  }
  process.exit(1);
});
