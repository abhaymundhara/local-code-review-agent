/**
 * Exports review results as inline comments in multiple formats.
 * Supports: GitHub PR review JSON, Markdown, SARIF-lite.
 * Built by SureThing.
 */

import * as fs from "fs";
import * as path from "path";
import { ParsedReview, ReviewIssue } from "../ollama/parser";

export type ExportFormat = "github" | "markdown" | "sarif";

export interface ExportOptions {
  format: ExportFormat;
  output?: string; // file path; if omitted, prints to stdout
}

// ── GitHub PR Review format ──────────────────────────────────────────────────
interface GitHubComment {
  path: string;
  position?: number;
  line?: number;
  body: string;
}

function toGitHubComments(review: ParsedReview): GitHubComment[] {
  return review.issues
    .filter((i) => i.file)
    .map((i) => ({
      path: i.file!,
      line: i.line,
      body: `**[${i.severity.toUpperCase()}]** ${i.description}

*Powered by local-code-review-agent · Built by SureThing*`,
    }));
}

// ── Markdown format ──────────────────────────────────────────────────────────
function toMarkdown(review: ParsedReview): string {
  const lines: string[] = ["# Code Review Results", ""];

  if (review.issues.length === 0) {
    lines.push("✅ No issues found.");
  } else {
    lines.push(`Found **${review.issues.length}** issue(s):`, "");
    for (const issue of review.issues) {
      const loc = issue.file
        ? `\`${issue.file}${issue.line ? `:${issue.line}` : ""}\``
        : "_no location_";
      lines.push(
        `- **[${issue.severity.toUpperCase()}]** ${loc} — ${issue.description}`,
      );
    }
  }

  if (review.lgtm.length > 0) {
    lines.push("", "## ✅ Looks Good", "");
    for (const item of review.lgtm) lines.push(`- ${item}`);
  }

  lines.push(
    "",
    "---",
    "*Powered by local-code-review-agent · Built by SureThing*",
  );
  return lines.join("\n");
}

// ── SARIF-lite format ────────────────────────────────────────────────────────
const SARIF_LEVEL: Record<string, string> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "note",
  info: "note",
};

function toSarif(review: ParsedReview): object {
  return {
    version: "2.1.0",
    $schema:
      "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "local-code-review-agent",
            version: "1.1.0",
            informationUri:
              "https://github.com/abhaymundhara/local-code-review-agent",
            rules: [],
          },
        },
        results: review.issues.map((i: ReviewIssue) => ({
          ruleId: `LCR-${i.severity.toUpperCase()}`,
          level: SARIF_LEVEL[i.severity] ?? "warning",
          message: { text: i.description },
          locations: i.file
            ? [
                {
                  physicalLocation: {
                    artifactLocation: { uri: i.file },
                    region: i.line ? { startLine: i.line } : undefined,
                  },
                },
              ]
            : [],
        })),
      },
    ],
  };
}

// ── Main export function ─────────────────────────────────────────────────────
export function exportReview(review: ParsedReview, opts: ExportOptions): void {
  let content: string;

  switch (opts.format) {
    case "github":
      content = JSON.stringify(toGitHubComments(review), null, 2);
      break;
    case "markdown":
      content = toMarkdown(review);
      break;
    case "sarif":
      content = JSON.stringify(toSarif(review), null, 2);
      break;
    default:
      throw new Error(`Unknown export format: ${opts.format}`);
  }

  if (opts.output) {
    const dir = path.dirname(opts.output);
    if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(opts.output, content, "utf-8");
    console.log(`✅ Exported ${opts.format} review to ${opts.output}`);
  } else {
    console.log(content);
  }
}
