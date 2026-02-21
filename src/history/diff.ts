/**
 * Diffs the current review result against the previous stored review.
 * Built by SureThing.
 */

import { ParsedReview, ReviewIssue } from '../ollama/parser';
import { HistoryEntry } from './store';

export interface ReviewDiff {
  newIssues: ReviewIssue[];
  resolvedIssues: ReviewIssue[];
  persistingIssues: ReviewIssue[];
}

function issueKey(i: ReviewIssue): string {
  return `${i.severity}::${i.file ?? ''}::${i.line ?? ''}::${i.description.slice(0, 60)}`;
}

export function diffReviews(current: ParsedReview, previous: HistoryEntry): ReviewDiff {
  const prevKeys = new Set(previous.issues.map(issueKey));
  const currKeys = new Set(current.issues.map(issueKey));

  const newIssues = current.issues.filter((i) => !prevKeys.has(issueKey(i)));
  const resolvedIssues = previous.issues.filter((i) => !currKeys.has(issueKey(i)));
  const persistingIssues = current.issues.filter((i) => prevKeys.has(issueKey(i)));

  return { newIssues, resolvedIssues, persistingIssues };
}

export function formatDiff(diff: ReviewDiff, useColor = true): string {
  const RESET = '\x1b[0m';
  const GREEN = '\x1b[32m';
  const RED = '\x1b[31m';
  const YELLOW = '\x1b[33m';
  const GRAY = '\x1b[90m';
  const BOLD = '\x1b[1m';
  const c = (code: string, text: string) => useColor ? `${code}${text}${RESET}` : text;

  const lines: string[] = [''];
  lines.push(c(BOLD, '📊 Review Diff (vs last run)'));
  lines.push(c(GRAY, '─'.repeat(50)));

  if (diff.newIssues.length === 0 && diff.resolvedIssues.length === 0) {
    lines.push(c(GRAY, 'No change from last review.'));
  } else {
    if (diff.resolvedIssues.length > 0) {
      lines.push('');
      lines.push(c(GREEN + BOLD, `✅ Resolved (${diff.resolvedIssues.length})`));
      for (const i of diff.resolvedIssues) {
        const loc = i.file ? ` ${i.file}${i.line ? `:${i.line}` : ''}` : '';
        lines.push(c(GREEN, `  ✔${loc} ${i.description}`));
      }
    }
    if (diff.newIssues.length > 0) {
      lines.push('');
      lines.push(c(RED + BOLD, `🆕 New issues (${diff.newIssues.length})`));
      for (const i of diff.newIssues) {
        const loc = i.file ? ` ${i.file}${i.line ? `:${i.line}` : ''}` : '';
        lines.push(c(RED, `  ▸${loc} [${i.severity}] ${i.description}`));
      }
    }
    if (diff.persistingIssues.length > 0) {
      lines.push('');
      lines.push(c(YELLOW + BOLD, `⏳ Still open (${diff.persistingIssues.length})`));
      for (const i of diff.persistingIssues) {
        const loc = i.file ? ` ${i.file}${i.line ? `:${i.line}` : ''}` : '';
        lines.push(c(YELLOW, `  · ${loc} [${i.severity}] ${i.description}`));
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}
