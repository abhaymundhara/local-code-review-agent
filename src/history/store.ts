/**
 * Persists review results to .codereview-history/ for diffing against last run.
 * Built by SureThing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ParsedReview } from '../ollama/parser';

const HISTORY_DIR = '.codereview-history';
const LATEST_FILE = 'latest.json';
const INDEX_FILE = 'index.json';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  model: string;
  mode: string;
  issueCount: number;
  issues: ParsedReview['issues'];
  lgtm: string[];
}

function historyDir(cwd = process.cwd()): string {
  return path.join(cwd, HISTORY_DIR);
}

export function saveReview(
  review: ParsedReview,
  meta: { model: string; mode: string },
  cwd = process.cwd()
): HistoryEntry {
  const dir = historyDir(cwd);
  fs.mkdirSync(dir, { recursive: true });

  // Add to .gitignore if not already there
  const gitignore = path.join(cwd, '.gitignore');
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, 'utf-8');
    if (!content.includes(HISTORY_DIR)) {
      fs.appendFileSync(gitignore, `
# Code review history
${HISTORY_DIR}/
`);
    }
  }

  const id = new Date().toISOString().replace(/[:.]/g, '-');
  const entry: HistoryEntry = {
    id,
    timestamp: new Date().toISOString(),
    model: meta.model,
    mode: meta.mode,
    issueCount: review.issues.length,
    issues: review.issues,
    lgtm: review.lgtm,
  };

  // Save timestamped entry
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(entry, null, 2), 'utf-8');

  // Update latest pointer
  fs.writeFileSync(path.join(dir, LATEST_FILE), JSON.stringify(entry, null, 2), 'utf-8');

  // Update index
  let index: string[] = [];
  const indexPath = path.join(dir, INDEX_FILE);
  if (fs.existsSync(indexPath)) {
    try { index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')); } catch {}
  }
  index.push(id);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');

  return entry;
}

export function loadLatestReview(cwd = process.cwd()): HistoryEntry | null {
  const latest = path.join(historyDir(cwd), LATEST_FILE);
  if (!fs.existsSync(latest)) return null;
  try {
    return JSON.parse(fs.readFileSync(latest, 'utf-8')) as HistoryEntry;
  } catch {
    return null;
  }
}

export function listHistory(cwd = process.cwd()): HistoryEntry[] {
  const dir = historyDir(cwd);
  if (!fs.existsSync(dir)) return [];
  const indexPath = path.join(dir, INDEX_FILE);
  if (!fs.existsSync(indexPath)) return [];
  try {
    const ids: string[] = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    return ids
      .map((id) => {
        const f = path.join(dir, `${id}.json`);
        if (!fs.existsSync(f)) return null;
        try { return JSON.parse(fs.readFileSync(f, 'utf-8')) as HistoryEntry; } catch { return null; }
      })
      .filter(Boolean) as HistoryEntry[];
  } catch {
    return [];
  }
}
