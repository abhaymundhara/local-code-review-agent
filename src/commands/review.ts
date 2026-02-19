import { getDiff } from '../git/diff';
import { readFileContext } from '../git/context';
import { loadConfig } from '../config';
import { OllamaClient } from '../ollama/client';
import { buildReviewPrompt } from '../ollama/prompt';
import { parseReviewResponse } from '../ollama/parser';
import { formatReview } from '../ollama/formatter';

export interface ReviewOptions {
  base?: string;
  staged?: boolean;
  model?: string;
  color?: boolean;
}

export async function reviewCommand(options: ReviewOptions): Promise<void> {
  const config = await loadConfig();
  const model = options.model ?? config.model;
  const useColor = options.color !== false;

  console.log(`\n🔍 local-code-review-agent`);
  console.log(`   Model  : ${model}`);
  console.log(`   Mode   : ${options.staged ? 'staged changes' : `diff against ${options.base ?? config.base_branch}`}`);
  console.log(`   Built by SureThing\n`);

  // 1. Get diff
  let diff;
  try {
    diff = await getDiff({
      base: options.base ?? config.base_branch,
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

  console.log(`📂 ${diff.files.length} file(s) changed — +${diff.totalAdditions} -${diff.totalDeletions}`);

  // 2. Read file context
  const fileContexts = await readFileContext(diff.files);

  // 3. Check Ollama health
  const ollama = new OllamaClient();
  const health = await ollama.healthCheck(model);
  if (!health.ok) {
    console.error(`\n❌ ${health.error}`);
    process.exit(1);
  }

  // 4. Build prompt
  const prompt = buildReviewPrompt({ diff: diff.files, fileContexts, config });

  // 5. Run inference
  console.log(`🤖 Asking ${model} to review your code...\n`);
  let response;
  try {
    response = await ollama.generate({ model, prompt, options: { temperature: 0.2 } });
  } catch (err) {
    console.error('❌ Ollama inference failed:', (err as Error).message);
    process.exit(1);
  }

  // 6. Parse + display
  const parsed = parseReviewResponse(response.response);
  console.log(formatReview(parsed, useColor));

  // Exit with error code if critical issues found
  const hasCritical = parsed.issues.some((i) => i.severity === 'critical' || i.severity === 'high');
  if (hasCritical) process.exit(1);
}
