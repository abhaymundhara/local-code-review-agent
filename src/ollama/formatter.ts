import { ParsedReview, Severity } from './parser';

/**
 * Terminal formatter for code review output.
 * Makes the output readable and actionable.
 * Built by SureThing.
 */

const SEVERITY_COLORS = {
  critical: '\x1b[31m', // red
  high: '\x1b[91m',    // bright red
  medium: '\x1b[33m',  // yellow
  low: '\x1b[36m',     // cyan
  info: '\x1b[90m',    // gray
};

const SEVERITY_ICONS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
  info: 'ℹ️ ',
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';

export function formatReview(review: ParsedReview, useColor = true): string {
  const lines: string[] = [];
  const c = (code: string, text: string) => useColor ? `${code}${text}${RESET}` : text;

  lines.push('');
  lines.push(c(BOLD, '🔍 Code Review Results'));
  lines.push(c('\x1b[90m', '─'.repeat(50)));

  if (review.issues.length === 0 && review.lgtm.length === 0) {
    lines.push(c(GREEN, '✅ No issues found. Clean diff!'));
    lines.push('');
    return lines.join('\n');
  }

  // Group issues by severity
  const order: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const grouped = order.map((s) => ({
    severity: s,
    items: review.issues.filter((i) => i.severity === s),
  })).filter((g) => g.items.length > 0);

  for (const group of grouped) {
    const icon = SEVERITY_ICONS[group.severity];
    const color = SEVERITY_COLORS[group.severity];
    lines.push('');
    lines.push(c(color + BOLD, `${icon} ${group.severity.toUpperCase()} (${group.items.length})`));

    for (const issue of group.items) {
      const location = issue.file
        ? c('\x1b[90m', ` ${issue.file}${issue.line ? `:${issue.line}` : ''}`)
        : '';
      lines.push(`  ${c(color, '▸')}${location} ${issue.description}`);
    }
  }

  // LGTM section
  if (review.lgtm.length > 0) {
    lines.push('');
    lines.push(c(GREEN + BOLD, '✅ Looks Good'));
    for (const item of review.lgtm) {
      lines.push(`  ${c(GREEN, '▸')} ${item}`);
    }
  }

  // Summary
  lines.push('');
  lines.push(c('\x1b[90m', '─'.repeat(50)));
  const critical = review.issues.filter((i) => i.severity === 'critical' || i.severity === 'high').length;
  if (critical > 0) {
    lines.push(c('\x1b[31m', `❌ ${critical} critical/high issue(s) found — review before merging`));
  } else if (review.issues.length > 0) {
    lines.push(c('\x1b[33m', `⚠️  ${review.issues.length} issue(s) found — consider addressing`));
  } else {
    lines.push(c(GREEN, '✅ All clear!'));
  }
  lines.push(c('\x1b[90m', 'Powered by Ollama · Built by SureThing'));
  lines.push('');

  return lines.join('\n');
}
