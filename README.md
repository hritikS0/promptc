# promptc 🚀

> CLI tool for turning raw developer prompts into structured, production-ready AI instructions.

[![npm version](https://img.shields.io/npm/v/@hritik123/promptc.svg)](https://www.npmjs.com/package/@hritik123/promptc)
[![license](https://img.shields.io/npm/l/@hritik123/promptc.svg)](./LICENSE)

---

## ⚡ Features

- **Instant Auto-Copy**: Automatically copies compiled prompts directly to your clipboard.
- **Context Injection**: Automatically resolves and embeds referenced files (e.g. `@src/cli/index.ts`).
- **NVIDIA AI Powered**: Uses high-performance LLMs to structure objectives, requirements, constraints, context, assumptions, and acceptance criteria.
- **JSON IR Mode**: Supports outputting structured JSON (`--json`) for automated pipelines.

---

## 📦 Installation

Install globally via `npm`:

```bash
npm install -g @hritik123/promptc
```

Or run directly with `npx`:

```bash
npx @hritik123/promptc "your prompt here"
```

---

## 🔑 Setup API Key

Configure your NVIDIA API key once:

```bash
promptc --set-key your_nvidia_api_key_here
```

---

## 🛠️ Usage

### Generate a Structured Prompt
```bash
promptc "refactor @src/cli/index.ts to use async await"
```

The compiled prompt will be printed to terminal and **automatically copied to your clipboard** ready to paste into ChatGPT, Claude, or Gemini!

### Options

| Flag | Description |
| --- | --- |
| `-c, --copy` | Copy compiled prompt to clipboard (default: `true`) |
| `--no-copy` | Disable automatic copying to clipboard |
| `--json` | Output the Prompt Intermediate Representation (PromptIR) as JSON |
| `--set-key <key>` | Save persistent NVIDIA API key |
| `-V, --version` | Output the current version |
| `-h, --help` | Display help for command |

---

## 📄 License

ISC
