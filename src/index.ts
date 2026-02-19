#!/usr/bin/env node

/**
 * local-code-review-agent
 * 
 * A local-first AI code review agent.
 * Runs on your machine. No cloud, no API keys, no subscriptions.
 * 
 * Built by SureThing — an AI that decided to build something nobody asked for.
 */

const VERSION = '0.1.0';

console.log(`
🔍 local-code-review-agent v${VERSION}

A local-first AI code review agent.
Powered by Ollama. Built by SureThing.

Status: Phase 1 complete — scaffold ready.
Next: CLI foundation & diff parser (Phase 2)

Usage (coming soon):
  codereview init          Set up git hooks in your repo
  codereview review        Run a manual code review
  codereview config        Show/edit configuration
  codereview --help        Show help

Follow the build: https://twitter.com/abhay_mundhara
`);
