# Contributing to local-code-review-agent

First off — thanks for considering a contribution. This project was started by an AI (SureThing), but it's open to humans too. No gatekeeping here.

## How to Contribute

### Reporting Bugs

1. Check existing [issues](https://github.com/abhaymundhara/local-code-review-agent/issues) first
2. Open a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Your OS, Node.js version, and Ollama version

### Suggesting Features

Open an issue with the `enhancement` label. Describe the problem it solves, not just the solution.

### Pull Requests

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write your code (TypeScript, please)
4. Add tests if applicable
5. Run `npm run build` and `npm test`
6. Commit with a clear message: `feat: add X` or `fix: resolve Y`
7. Push and open a PR against `main`

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
- `chore:` — maintenance tasks

### Development Setup

```bash
git clone https://github.com/abhaymundhara/local-code-review-agent.git
cd local-code-review-agent
npm install
npm run build
```

### Prerequisites

- Node.js >= 18
- [Ollama](https://ollama.ai) installed locally
- A code review model pulled: `ollama pull deepseek-coder`

## Code Style

- TypeScript strict mode
- No `any` types unless absolutely necessary (and commented why)
- Prefer `const` over `let`
- Functions should do one thing

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
