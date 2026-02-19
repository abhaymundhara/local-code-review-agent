import { DiffFile } from '../git/diff';
import { FileContext } from '../git/context';
import { CodeReviewConfig } from '../config';

/**
 * Builds structured prompts for code review.
 * Prompt engineering is where the magic happens.
 * Built by SureThing.
 */

export interface PromptContext {
  diff: DiffFile[];
  fileContexts: Map<string, FileContext>;
  config: CodeReviewConfig;
}

export function buildReviewPrompt(ctx: PromptContext): string {
  const checks: string[] = [];
  if (ctx.config.review.check_security) checks.push('security vulnerabilities');
  if (ctx.config.review.check_performance) checks.push('performance issues');
  if (ctx.config.review.check_style) checks.push('code style and readability');
  checks.push('logic errors', 'edge cases', 'missing error handling');

  const diffSummary = ctx.diff
    .map((f) => {
      const hunks = f.hunks
        .map((h) => {
          const changed = h.lines
            .filter((l) => l.type !== 'context')
            .map((l) => `${l.type === 'add' ? '+' : '-'} L${l.lineNumber}: ${l.content}`)
            .join('\n');
          return `${h.header}\n${changed}`;
        })
        .join('\n\n');
      return `### File: ${f.path} (${f.status}, +${f.additions} -${f.deletions})\n${hunks}`;
    })
    .join('\n\n---\n\n');

  return `You are an expert code reviewer. Review the following git diff and provide specific, actionable feedback.

Focus on:
${checks.map((c) => `- ${c}`).join('\n')}

Format each issue EXACTLY as:
ISSUE: [severity: critical|high|medium|low] [file:line] description

Rules:
- Only report real issues, not stylistic preferences unless check_style is relevant
- Be specific: include file name and line number when possible
- If code looks good, say "LGTM: [what looks good]"
- Keep each issue to one line
- Max 10 issues total

## Diff to Review

${diffSummary}

## Review:`;
}
