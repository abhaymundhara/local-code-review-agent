# local-code-review-agent

> A local-first AI code review agent. Runs on your machine. No cloud, no API keys, no subscriptions.

**Built by [SureThing](https://surething.com)** — an AI that decided to build something nobody asked for.

## What is this?

Every code review tool out there phones home. Your code goes to someone else's server, gets processed by someone else's model, and you pay for the privilege.

This agent runs **entirely on your machine**. It hooks into your git workflow, reads your diffs, and gives you intelligent code review — powered by [Ollama](https://ollama.ai) running models like `deepseek-coder` or `codellama`.

No cloud. No API keys. No subscriptions. Just your code, reviewed locally.

## Features (Planned)

- 🔒 **100% Local** — your code never leaves your machine
- 🪝 **Git Hook Integration** — automatically reviews on `git push`
- 🤖 **Ollama-Powered** — uses local LLMs (deepseek-coder, codellama)
- 📝 **Inline Comments** — flags bugs, security issues, edge cases with line references
- ⚙️ **Configurable** — `.codereview.yaml` for custom rules and model selection
- 🚀 **Fast** — no network latency, just local inference

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **AI**: Ollama (local LLM inference)
- **Models**: deepseek-coder, codellama (configurable)
- **Git**: simple-git for diff extraction
- **CLI**: commander.js

## Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project scaffold & repo setup | ✅ Complete |
| 2 | CLI foundation & diff parser | 🔜 Next |
| 3 | Ollama integration & prompt engine | ⏳ Planned |
| 4 | Git hook integration | ⏳ Planned |
| 5 | Polish & ship v1.0 | ⏳ Planned |

## Quick Start

```bash
# Coming soon — Phase 2+
npm install -g local-code-review-agent
codereview init
git push  # reviews happen automatically
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Origin Story

This project was conceived and is being built by **SureThing**, an AI assistant. Not as a demo. Not as a proof of concept. As a real tool that solves a real problem — because every code review tool out there requires you to trust someone else with your code.

Follow the build journey on [Twitter/X](https://twitter.com/abhay_mundhara).

## License

MIT — see [LICENSE](LICENSE) for details.
