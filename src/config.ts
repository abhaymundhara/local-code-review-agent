import * as fs from 'fs';
import * as path from 'path';

export interface CodeReviewConfig {
  model: string;
  base_branch: string;
  review: {
    check_security: boolean;
    check_performance: boolean;
    check_style: boolean;
    max_file_size_kb: number;
  };
  ignore: string[];
}

export const DEFAULT_CONFIG: CodeReviewConfig = {
  model: 'deepseek-coder',
  base_branch: 'main',
  review: {
    check_security: true,
    check_performance: true,
    check_style: true,
    max_file_size_kb: 500,
  },
  ignore: ['*.lock', 'dist/**', 'node_modules/**', '*.min.js'],
};

/**
 * Load config from .codereview.yaml, merging with defaults.
 * Searches current directory and parent directories (up to 3 levels).
 */
export async function loadConfig(cwd?: string): Promise<CodeReviewConfig> {
  const searchDir = cwd ?? process.cwd();
  const configFile = findConfigFile(searchDir);

  if (!configFile) {
    return DEFAULT_CONFIG;
  }

  try {
    // Lazy-load yaml parser at runtime (will be installed in Phase 3)
    // For now, do basic YAML key: value parsing for simple configs
    const content = fs.readFileSync(configFile, 'utf-8');
    const parsed = parseSimpleYaml(content);
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function findConfigFile(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 4; i++) {
    const candidate = path.join(dir, '.codereview.yaml');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function mergeConfig(defaults: CodeReviewConfig, override: Partial<CodeReviewConfig>): CodeReviewConfig {
  return {
    ...defaults,
    ...override,
    review: {
      ...defaults.review,
      ...(override.review ?? {}),
    },
    ignore: override.ignore ?? defaults.ignore,
  };
}

/** Minimal YAML parser for simple key: value structures */
function parseSimpleYaml(content: string): Partial<CodeReviewConfig> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  let currentSection: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header (no leading space, ends with ':')
    if (!line.startsWith(' ') && trimmed.endsWith(':') && !trimmed.includes(': ')) {
      currentSection = trimmed.slice(0, -1);
      result[currentSection] = {};
      continue;
    }

    // List item
    if (trimmed.startsWith('- ')) {
      const key = currentSection ?? '__root__';
      if (!Array.isArray(result[key])) result[key] = [];
      (result[key] as string[]).push(trimmed.slice(2).replace(/["']/g, ''));
      continue;
    }

    // Key: value
    const kvMatch = trimmed.match(/^([\w_]+):\s*(.+)$/);
    if (kvMatch) {
      const [, k, v] = kvMatch;
      const parsed = v === 'true' ? true : v === 'false' ? false : isNaN(Number(v)) ? v.replace(/["']/g, '') : Number(v);
      if (currentSection && typeof result[currentSection] === 'object' && result[currentSection] !== null) {
        (result[currentSection] as Record<string, unknown>)[k] = parsed;
      } else {
        result[k] = parsed;
      }
    }
  }

  return result as Partial<CodeReviewConfig>;
}
