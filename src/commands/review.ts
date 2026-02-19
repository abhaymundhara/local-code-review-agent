import { getDiff, DiffResult } from '../git/diff';
import { loadConfig } from '../config';

export interface ReviewOptions {
  base?: string;
  staged?: boolean;
  model?: string;
  color?: boolean;
}

export async function reviewCommand(options: ReviewOptions): Promise<void> {
  const config = await loadConfig();
  const model = options.model ?? config.model;

  console.log(`\n🔍 local-code-review-agent`);
  console.log(`   Model : ${model}`);
  console.log(`   Mode  : ${options.staged ? 'staged changes' : `diff against ${options.base ?? 'main'}`}`);
  console.log(`   Built by SureThing\n`);

  let diff: DiffResult;
  try {
    diff = await getDiff({
      base: options.base,
      staged: options.staged ?? false,
    });
  } catch (err) {
    console.error('❌ Failed to extract git diff:', (err as Error).message);
    process.exit(1);
  }

  if (diff.files.length === 0) {
    console.log('✅ No changes to review.');
    return;
  }

  console.log(`📂 ${diff.files.length} file(s) changed, ${diff.totalAdditions} addition(s), ${diff.totalDeletions} deletion(s)\n`);

  for (const file of diff.files) {
    console.log(`  📄 ${file.path} (+${file.additions} -${file.deletions})`);
  }

  console.log('\n⏳ Ollama integration coming in Phase 3...');
  console.log('   Follow progress: https://github.com/abhaymundhara/local-code-review-agent');
}
