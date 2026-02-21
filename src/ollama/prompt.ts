import { DiffFile } from '../git/diff';
import { FileContext } from '../git/context';
import { CodeReviewConfig } from '../config';

/**
 * Builds structured prompts for code review.
 * Includes language-aware fine-tuned prompts for Rust, Go, Python, JS/TS.
 * Built by SureThing.
 */

export interface PromptContext {
  diff: DiffFile[];
  fileContexts: Map<string, FileContext>;
  config: CodeReviewConfig;
}

type Language = 'rust' | 'go' | 'python' | 'typescript' | 'javascript' | 'generic';

function detectLanguage(files: DiffFile[]): Language {
  const exts = files.map((f) => f.path.split('.').pop()?.toLowerCase() ?? '');
  const counts: Record<Language, number> = { rust: 0, go: 0, python: 0, typescript: 0, javascript: 0, generic: 0 };
  for (const ext of exts) {
    if (ext === 'rs') counts.rust++;
    else if (ext === 'go') counts.go++;
    else if (ext === 'py') counts.python++;
    else if (ext === 'ts' || ext === 'tsx') counts.typescript++;
    else if (ext === 'js' || ext === 'jsx' || ext === 'mjs') counts.javascript++;
    else counts.generic++;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Language) ?? 'generic';
}

const LANGUAGE_HINTS: Record<Language, string> = {
  rust: `Language: Rust.
Extra focus:
- Ownership/borrowing violations or unnecessary clones
- Missing error propagation (? operator vs .unwrap()/.expect())
- Lifetime annotation issues
- Unsafe blocks without justification
- Panic-prone patterns (index out of bounds, integer overflow in release)`,

  go: `Language: Go.
Extra focus:
- Goroutine leaks (channels never closed, goroutines that never exit)
- Error return values that are silently ignored
- Race conditions (shared mutable state without sync)
- defer inside loops (subtle resource exhaustion)
- Missing context cancellation propagation`,

  python: `Language: Python.
Extra focus:
- Mutable default arguments (def f(x=[]))
- Bare except clauses that swallow all errors
- Missing type hints where they aid clarity
- N+1 query patterns or missing async/await in async functions
- import * that pollutes namespace`,

  typescript: `Language: TypeScript.
Extra focus:
- Use of 'any' type that defeats type safety
- Non-null assertions (!) without justification
- Missing error handling in async/await chains
- Type-unsafe casts (as SomeType without validation)
- Missing return types on exported functions`,

  javascript: `Language: JavaScript.
Extra focus:
- Implicit type coercions (== vs ===)
- Unhandled promise rejections
- var usage instead of const/let
- Callback-style code that should use async/await
- Missing null/undefined checks`,

  generic: '',
};

export function buildReviewPrompt(ctx: PromptContext): string {
  const checks: string[] = [];
  if (ctx.config.review.check_security) checks.push('security vulnerabilities');
  if (ctx.config.review.check_performance) checks.push('performance issues');
  if (ctx.config.review.check_style) checks.push('code style and readability');
  checks.push('logic errors', 'edge cases', 'missing error handling');

  const language = detectLanguage(ctx.diff);
  const langHint = LANGUAGE_HINTS[language];

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
${langHint ? '\n' + langHint : ''}

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
