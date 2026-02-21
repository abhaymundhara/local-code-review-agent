#!/usr/bin/env node
/**
 * CLI entry point for local-code-review-agent.
 * Built by SureThing.
 */

import { Command } from "commander";
import { reviewCommand } from "./commands/review";
import { initCommand } from "./commands/init";
import { configCommand } from "./commands/config";
import {
  installHookCommand,
  uninstallHookCommand,
} from "./commands/install-hook";
import { listHistory, loadLatestReview } from "./history/store";

export const program = new Command();

program
  .name("codereview")
  .description(
    "Local-first AI code review agent. No cloud, no API keys, no subscriptions.",
  )
  .version("1.1.0");

program
  .command("review")
  .description("Review current changes")
  .option("-b, --base <branch>", "Base branch to diff against")
  .option("--staged", "Review only staged changes")
  .option("-m, --model <model>", "Ollama model to use")
  .option("--no-color", "Disable colored output")
  .option("--since-last", "Show diff from last review run")
  .option("--export <format>", "Export results: github | markdown | sarif")
  .option(
    "--export-output <path>",
    "File path for export output (stdout if omitted)",
  )
  .action(async (opts) => {
    await reviewCommand({
      base: opts.base,
      staged: opts.staged,
      model: opts.model,
      color: opts.color,
      sinceLast: opts.sinceLast,
      export: opts.export as any,
      exportOutput: opts.exportOutput,
    });
  });

program
  .command("init")
  .description("Initialize .codereview.yaml in current repo")
  .option("--hook", "Install pre-push git hook", false)
  .action(async (opts) => {
    await initCommand({ hook: opts.hook });
  });

program
  .command("config")
  .description("Manage configuration")
  .option("--show", "Show current configuration")
  .action(async (opts) => {
    await configCommand(opts);
  });

program
  .command("install-hook")
  .description("Install git hook for automatic reviews")
  .option("--advisory", "Advisory mode — warn but don't block")
  .option("--pre-commit", "Install as pre-commit hook instead of pre-push")
  .action(async (opts) => {
    await installHookCommand({
      advisory: opts.advisory,
      preCommit: opts.preCommit,
    });
  });

program
  .command("uninstall-hook")
  .description("Remove installed git hook")
  .option("--pre-commit", "Remove pre-commit hook (default: pre-push)", false)
  .action(async (opts) => {
    await uninstallHookCommand({ preCommit: opts.preCommit });
  });

program
  .command("history")
  .description("Show review history")
  .option("--latest", "Show only the most recent review")
  .option("--count <n>", "Number of past reviews to list", "10")
  .action((opts) => {
    if (opts.latest) {
      const entry = loadLatestReview();
      if (!entry) {
        console.log("No review history found.");
        return;
      }
      console.log(`\nLast review: ${entry.timestamp}`);
      console.log(`Model: ${entry.model} | Mode: ${entry.mode}`);
      console.log(`Issues found: ${entry.issueCount}\n`);
      for (const issue of entry.issues) {
        const loc = issue.file
          ? ` ${issue.file}${issue.line ? `:${issue.line}` : ""}`
          : "";
        console.log(
          `  [${issue.severity.toUpperCase()}]${loc} ${issue.description}`,
        );
      }
      return;
    }

    const count = parseInt(opts.count, 10);
    const entries = listHistory().slice(-count).reverse();
    if (entries.length === 0) {
      console.log('No review history found. Run "codereview review" first.');
      return;
    }
    console.log(`\n📋 Review History (last ${entries.length})\n`);
    for (const e of entries) {
      const ts = new Date(e.timestamp).toLocaleString();
      console.log(
        `  ${ts}  [${e.model}]  ${e.issueCount} issue(s)  (${e.mode})`,
      );
    }
    console.log("");
  });
