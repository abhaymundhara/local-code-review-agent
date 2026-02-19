import { HookManager, HookType, HookMode } from '../hooks/manager';

export interface InstallHookOptions {
  preCommit?: boolean;
  advisory?: boolean;
  model?: string;
}

export async function installHookCommand(options: InstallHookOptions): Promise<void> {
  const hookType: HookType = options.preCommit ? 'pre-commit' : 'pre-push';
  const mode: HookMode = options.advisory ? 'advisory' : 'blocking';

  console.log(`\n🎙️  Installing ${hookType} hook (${mode} mode)...`);

  try {
    const manager = new HookManager();
    manager.install({ type: hookType, mode, model: options.model });
    console.log(`  ✅ Installed ${hookType} hook`);
    console.log(`  🛡️  Mode: ${mode === 'blocking' ? 'blocking (will stop push/commit on critical issues)' : 'advisory (will warn but not block)'}`);
    console.log(`\n  Your code will be reviewed automatically before each ${hookType === 'pre-push' ? 'push' : 'commit'}.`);
    console.log(`  Make sure Ollama is running: ollama serve\n`);
  } catch (err) {
    console.error('  ❌ Failed:', (err as Error).message);
    process.exit(1);
  }
}

export async function uninstallHookCommand(options: { preCommit?: boolean }): Promise<void> {
  const hookType: HookType = options.preCommit ? 'pre-commit' : 'pre-push';

  console.log(`\n🗑️  Uninstalling ${hookType} hook...`);

  try {
    const manager = new HookManager();
    manager.uninstall(hookType);
  } catch (err) {
    console.error('  ❌ Failed:', (err as Error).message);
    process.exit(1);
  }
}
