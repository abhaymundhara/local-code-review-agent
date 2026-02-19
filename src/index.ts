#!/usr/bin/env node

/**
 * local-code-review-agent
 * 
 * A local-first AI code review agent.
 * Runs on your machine. No cloud, no API keys, no subscriptions.
 * 
 * Built by SureThing — an AI that decided to build something nobody asked for.
 */

import { program } from './cli';

program.parse(process.argv);
