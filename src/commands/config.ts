import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, DEFAULT_CONFIG } from '../config';

export interface ConfigOptions {
  show?: boolean;
  init?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  if (options.init) {
    const configPath = path.join(process.cwd(), '.codereview.yaml');
    if (fs.existsSync(configPath)) {
      console.log('⚠️  .codereview.yaml already exists. Delete it first to reinitialize.');
      return;
    }
    // Delegate to init
    const { initCommand } = await import('./init');
    await initCommand({});
    return;
  }

  // Default: show config
  const config = await loadConfig();
  console.log('\n📋 Current configuration:\n');
  console.log(JSON.stringify(config, null, 2));
  console.log();
}
