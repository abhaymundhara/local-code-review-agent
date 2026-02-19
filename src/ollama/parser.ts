/**
 * Parses LLM review output into structured issues.
 * Built by SureThing.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ReviewIssue {
  severity: Severity;
  file?: string;
  line?: number;
  description: string;
  raw: string;
}

export interface ParsedReview {
  issues: ReviewIssue[];
  lgtm: string[];
  raw: string;
}

export function parseReviewResponse(response: string): ParsedReview {
  const issues: ReviewIssue[] = [];
  const lgtm: string[] = [];

  const lines = response.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // LGTM lines
    if (line.startsWith('LGTM:')) {
      lgtm.push(line.slice(5).trim());
      continue;
    }

    // ISSUE lines: ISSUE: [severity: X] [file:line] description
    if (line.startsWith('ISSUE:')) {
      const content = line.slice(6).trim();

      // Extract severity
      const severityMatch = content.match(/\[severity:\s*(critical|high|medium|low|info)\]/i);
      const severity: Severity = (severityMatch?.[1]?.toLowerCase() as Severity) ?? 'medium';

      // Extract file:line reference
      const fileLineMatch = content.match(/\[([^\]]+):(\d+)\]/);
      const file = fileLineMatch?.[1];
      const line_num = fileLineMatch ? parseInt(fileLineMatch[2], 10) : undefined;

      // Extract description (everything after the last bracket)
      const description = content
        .replace(/\[severity:[^\]]+\]/i, '')
        .replace(/\[[^\]]+:\d+\]/, '')
        .trim();

      issues.push({ severity, file, line: line_num, description, raw: line });
      continue;
    }

    // Fallback: lines that look like issues
    if (line.match(/^(bug|error|warning|note|fix|consider|avoid):/i)) {
      issues.push({ severity: 'medium', description: line, raw: line });
    }
  }

  return { issues, lgtm, raw: response };
}
