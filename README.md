# local-code-review-agent

> A local-first AI code review agent. Runs on your machine. No cloud, no API keys, no subscriptions.

[![CI](https://github.com/abhaymundhara/local-code-review-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/abhaymundhara/local-code-review-agent/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/local-code-review-agent)](https://www.npmjs.com/package/local-code-review-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Built by [SureThing](https://surething.com)** — an AI that decided to build something nobody asked for.

---

## What is this?

Every code review tool out there phones home. Your code goes to someone else's server, gets processed by someone else's model, and you pay for the privilege.

**local-code-review-agent** runs entirely on your machine. It hooks into your git workflow, reads your diffs, and gives you intelligent code review — powered by [Ollama](https://ollama.ai) running models like `deepseek-coder` or `codellama`.

No cloud. No API keys. No subscriptions. Just your code, reviewed locally.

---

## Quick Start

### Prerequisites

1. **Node.js >= 18**
2. **[Ollama](https://ollama.ai)** installed and running
3. A code model pulled:
   ```bash
   ollama pull deepseek-coder
   ```

### Install

```bash
npm install -g local-code-review-agent
```

### Initialize in your project

```bash
cd your-project
codereview init
```

### Run a review

```bash
# Review changes vs main branch
codereview review

# Review staged changes only
codereview review --staged

# Use a specific model
codereview review --model codellama
```

### Install git hook (auto-reviews on push)

```bash
# Blocking mode: stops the push if critical issues found
codereview install-hook

# Advisory mode: warns but doesn't block
codereview install-hook --advisory

# Run on commit instead of push
codereview install-hook --pre-commit
```

---

## Example Output

```
🔍 local-code-review-agent
   Model  : deepseek-coder
   Mode   : diff against main
   Built by SureThing

📂 3 file(s) changed — +87 -12
🤖 Asking deepseek-coder to review your code...

🔍 Code Review Results
──────────────────────────────────────────────────

🟠 HIGH (1)
  ▸ src/auth.ts:42 Missing input validation on user-supplied token before passing to DB query

🟡 MEDIUM (2)
  ▸ src/utils.ts:17 No error handling for failed fetch — will crash silently
  ▸ src/config.ts:88 Magic number 86400 should be a named constant (SECONDS_PER_DAY)

✅ Looks Good
  ▸ Clean separation of concerns in the new module structure
  ▸ TypeScript types are well-defined

──────────────────────────────────────────────────
⚠️  3 issue(s) found — consider addressing
Powered by Ollama · Built by SureThing
```

---

## Configuration

Create a `.codereview.yaml` in your project root (or run `codereview init`):

```yaml
# local-code-review-agent configuration

model: deepseek-coder       # Ollama model to use
base_branch: main           # Branch to diff against

review:
  check_security: true      # Check for security vulnerabilities
  check_performance: true   # Check for performance issues
  check_style: true         # Check code style
  max_file_size_kb: 500     # Skip files larger than this

ignore:
  - "*.lock"
  - "dist/**"
  - "node_modules/**"
  - "*.min.js"
```

---

## Commands

| Command | Description |
|---------|-------------|
| `codereview review` | Review current changes vs base branch |
| `codereview review --staged` | Review only staged changes |
| `codereview review --model <model>` | Use a specific Ollama model |
| `codereview init` | Set up config in current repo |
| `codereview install-hook` | Install pre-push git hook |
| `codereview install-hook --pre-commit` | Install pre-commit hook |
| `codereview install-hook --advisory` | Install in advisory (non-blocking) mode |
| `codereview uninstall-hook` | Remove installed hook |
| `codereview config --show` | Show current configuration |

---

## Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project scaffold & repo setup | ✅ Done |
| 2 | CLI foundation & diff parser | ✅ Done |
| 3 | Ollama integration & prompt engine | ✅ Done |
| 4 | Git hook integration | ✅ Done |
| 5 | Polish & ship v1.0 | ✅ Done |

**v1.0.0 is live.** Future work:
- [ ] Multi-file inline comment export
- [ ] VS Code extension
- [ ] Support for more languages (Rust, Go, Python fine-tuned prompts)
- [ ] Review history / diff from last review

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Origin Story

This project was conceived and built by **SureThing**, an AI assistant. Not as a demo. Not as a proof of concept. As a real tool that solves a real problem — because every code review tool out there requires you to trust someone else with your code.

Follow the build journey on [Twitter/X](https://twitter.com/abhay_mundhara).

## License

MIT — see [LICENSE](LICENSE) for details.
