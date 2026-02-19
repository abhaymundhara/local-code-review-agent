import * as fs from 'fs';
import * as path from 'path';

export interface InitOptions {
  hook?: boolean;
}

const HOOK_SCRIPT = `#!/bin/sh
# local-code-review-agent pre-push hook
# Installed by SureThing
echo "🔍 Running local AI code review..."
codereview review --staged
if [ $? -ne 0 ]; then
  echo "❌ Code review found issues. Fix them or use git push --no-verify to skip."
  exit 1
fi
echo "✅ Code review passed."
`;

export async function initCommand(options: InitOptions): Promise<void> {
  console.log('\n🚀 Initializing local-code-review-agent...');

  // Create default config
  const configPath = path.join(process.cwd(), '.codereview.yaml');
  if (!fs.existsSync(configPath)) {
    const defaultConfig = `# local-code-review-agent configuration
# Built by SureThing

model: deepseek-coder
base_branch: main

review:
  check_security: true
  check_performance: true
  check_style: true
  max_file_size_kb: 500

ignore:
  - "*.lock"
  - "dist/**"
  - "node_modules/**"
  - "*.min.js"
`;
    fs.writeFileSync(configPath, defaultConfig);
    console.log('  ✅ Created .codereview.yaml');
  } else {
    console.log('  ℹ️  .codereview.yaml already exists');
  }

  // Install git hook
  if (options.hook) {
    const hooksDir = path.join(process.cwd(), '.git', 'hooks');
    if (!fs.existsSync(hooksDir)) {
      console.error('  ❌ Not a git repository (no .git/hooks found)');
      process.exit(1);
    }
    const hookPath = path.join(hooksDir, 'pre-push');
    fs.writeFileSync(hookPath, HOOK_SCRIPT);
    fs.chmodSync(hookPath, 0o755);
    console.log('  ✅ Installed pre-push git hook');
  }

  console.log('\n✅ Done! Run `codereview review` to try it out.');
  console.log('   Make sure Ollama is running: `ollama serve`');
  console.log('   Pull a model if needed: `ollama pull deepseek-coder`\n');
}
