# local-code-review-agent Usage

## Prerequisites

1. Node.js 18+
2. Ollama installed and running
3. At least one model pulled (example: `deepseek-coder`)

```bash
ollama pull deepseek-coder
```

## Option 1: Install globally from local source (recommended for now)

```bash
cd /path/to/local-code-review-agent
npm install
npm run build
npm link
```

> Note: `npm install -g local-code-review-agent` currently returns 404 because the package is not available on the npm registry.

Then in any git repo:

```bash
codereview init
codereview review
```

## Option 2: Run from this source repo

From the project root:

```bash
npm install
npm run build
```

Run directly without global install:

```bash
node dist/index.js --help
node dist/index.js init
node dist/index.js review
```

Optional: link it globally for local development:

```bash
npm link
codereview --help
```

## Common commands

```bash
# Review changes against main
codereview review

# Review only staged changes
codereview review --staged

# Use a specific model
codereview review --model codellama

# Install git hook (pre-push)
codereview install-hook

# Install advisory hook (won't block push)
codereview install-hook --advisory

# Install pre-commit hook instead of pre-push
codereview install-hook --pre-commit

# Show config
codereview config --show
```

## Quick troubleshooting

- If reviews fail immediately, confirm Ollama is running.
- If model is missing, pull one first: `ollama pull deepseek-coder`.
- If command not found after global install, restart terminal or verify npm global bin is on your PATH.
