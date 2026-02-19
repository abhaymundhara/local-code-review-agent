import * as fs from 'fs';
import * as path from 'path';

/**
 * Git hook manager.
 * Installs, uninstalls, and checks status of git hooks.
 * Built by SureThing.
 */

export type HookType = 'pre-push' | 'pre-commit';
export type HookMode = 'blocking' | 'advisory';

export interface HookOptions {
  type: HookType;
  mode: HookMode;
  model?: string;
}

export interface HookStatus {
  installed: boolean;
  type?: HookType;
  mode?: HookMode;
  path?: string;
}

const HOOK_MARKER = '# local-code-review-agent';

export class HookManager {
  private gitRoot: string;
  private hooksDir: string;

  constructor(cwd = process.cwd()) {
    this.gitRoot = findGitRoot(cwd);
    this.hooksDir = path.join(this.gitRoot, '.git', 'hooks');
  }

  install(options: HookOptions): void {
    if (!fs.existsSync(this.hooksDir)) {
      throw new Error(`Not a git repository: ${this.gitRoot}`);
    }

    const hookPath = path.join(this.hooksDir, options.type);

    // Backup existing hook if not ours
    if (fs.existsSync(hookPath)) {
      const existing = fs.readFileSync(hookPath, 'utf-8');
      if (!existing.includes(HOOK_MARKER)) {
        fs.writeFileSync(`${hookPath}.bak`, existing);
        console.log(`  ⚠️  Backed up existing ${options.type} hook to ${options.type}.bak`);
      }
    }

    const script = generateHookScript(options);
    fs.writeFileSync(hookPath, script);
    fs.chmodSync(hookPath, 0o755);
  }

  uninstall(type: HookType): void {
    const hookPath = path.join(this.hooksDir, type);
    if (!fs.existsSync(hookPath)) {
      console.log(`  ℹ️  No ${type} hook found.`);
      return;
    }

    const content = fs.readFileSync(hookPath, 'utf-8');
    if (!content.includes(HOOK_MARKER)) {
      console.log(`  ⚠️  ${type} hook was not installed by local-code-review-agent. Not removing.`);
      return;
    }

    fs.unlinkSync(hookPath);

    // Restore backup if it exists
    const backupPath = `${hookPath}.bak`;
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, hookPath);
      console.log(`  ✅ Restored original ${type} hook from backup.`);
    } else {
      console.log(`  ✅ Removed ${type} hook.`);
    }
  }

  status(type: HookType): HookStatus {
    const hookPath = path.join(this.hooksDir, type);
    if (!fs.existsSync(hookPath)) {
      return { installed: false };
    }

    const content = fs.readFileSync(hookPath, 'utf-8');
    if (!content.includes(HOOK_MARKER)) {
      return { installed: false };
    }

    const mode: HookMode = content.includes('--advisory') ? 'advisory' : 'blocking';
    return { installed: true, type, mode, path: hookPath };
  }
}

function generateHookScript(options: HookOptions): string {
  const reviewArgs = options.type === 'pre-commit' ? '--staged' : '';
  const modelArg = options.model ? `--model ${options.model}` : '';
  const exitOnFail = options.mode === 'blocking' ? `
if [ $exit_code -ne 0 ]; then
  echo ""
  echo "❌ Code review found critical issues. Fix them or use git ${options.type === 'pre-push' ? 'push' : 'commit'} --no-verify to skip."
  exit 1
fi` : `
if [ $exit_code -ne 0 ]; then
  echo ""
  echo "⚠️  Code review found issues (advisory mode — not blocking)."
fi`;

  return `#!/bin/sh
${HOOK_MARKER}
# Hook type: ${options.type}
# Mode: ${options.mode}
# Installed by SureThing 🤖

echo ""
echo "🔍 Running local AI code review (SureThing)..."
echo ""

codereview review ${reviewArgs} ${modelArg} --no-color
exit_code=$?
${exitOnFail}

exit 0
`;
}

function findGitRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('Not inside a git repository.');
    dir = parent;
  }
}
