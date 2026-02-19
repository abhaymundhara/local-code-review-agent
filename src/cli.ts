import { Command } from 'commander';
import { reviewCommand } from './commands/review';
import { initCommand } from './commands/init';
import { configCommand } from './commands/config';

const VERSION = '0.2.0';

export const program = new Command();

program
  .name('codereview')
  .description(
    'Local-first AI code review agent.\nNo cloud. No API keys. No subscriptions.\nBuilt by SureThing.'
  )
  .version(VERSION, '-v, --version', 'Show version number');

program
  .command('review')
  .description('Run a code review on current changes')
  .option('-b, --base <branch>', 'Base branch to diff against', 'main')
  .option('-s, --staged', 'Review only staged changes', false)
  .option('-m, --model <model>', 'Ollama model to use (overrides config)')
  .option('--no-color', 'Disable colored output')
  .action(reviewCommand);

program
  .command('init')
  .description('Set up codereview in the current git repository')
  .option('--hook', 'Install pre-push git hook', false)
  .action(initCommand);

program
  .command('config')
  .description('Show or edit configuration')
  .option('--show', 'Show current config', false)
  .option('--init', 'Create a default .codereview.yaml', false)
  .action(configCommand);

export default program;
