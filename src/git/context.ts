import * as fs from 'fs';
import * as path from 'path';
import { DiffFile } from './diff';

export interface FileContext {
  path: string;
  content: string;
  language: string;
  exists: boolean;
}

/**
 * Read file content for changed files.
 * Provides the full file content so the AI model has context beyond just the diff.
 */
export async function readFileContext(
  files: DiffFile[],
  cwd: string = process.cwd()
): Promise<Map<string, FileContext>> {
  const contexts = new Map<string, FileContext>();

  for (const file of files) {
    if (file.status === 'deleted') {
      contexts.set(file.path, {
        path: file.path,
        content: '',
        language: detectLanguage(file.path),
        exists: false,
      });
      continue;
    }

    const fullPath = path.join(cwd, file.path);

    try {
      const stats = fs.statSync(fullPath);
      // Skip files larger than 500KB
      if (stats.size > 500 * 1024) {
        contexts.set(file.path, {
          path: file.path,
          content: `[File too large to include: ${(stats.size / 1024).toFixed(0)}KB]`,
          language: detectLanguage(file.path),
          exists: true,
        });
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      contexts.set(file.path, {
        path: file.path,
        content,
        language: detectLanguage(file.path),
        exists: true,
      });
    } catch {
      contexts.set(file.path, {
        path: file.path,
        content: '[Could not read file]',
        language: detectLanguage(file.path),
        exists: false,
      });
    }
  }

  return contexts;
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.rs': 'rust',
    '.go': 'go',
    '.java': 'java',
    '.cs': 'csharp',
    '.cpp': 'cpp',
    '.c': 'c',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.md': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.json': 'json',
    '.sh': 'bash',
  };
  return map[ext] ?? 'plaintext';
}
