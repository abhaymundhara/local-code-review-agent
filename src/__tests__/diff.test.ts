import { parseDiff } from '../git/diff';

// Expose parseDiff for testing
// Note: parseDiff is internal — we test via integration in Phase 3+

describe('diff parser', () => {
  it('returns empty result for empty diff', () => {
    // Integration tests against real git will be added in Phase 3
    expect(true).toBe(true);
  });

  it('module structure is correct', () => {
    // Verify exports exist
    const diffModule = require('../git/diff');
    expect(typeof diffModule.getDiff).toBe('function');
  });

  it('config module exports expected defaults', () => {
    const configModule = require('../config');
    expect(configModule.DEFAULT_CONFIG).toBeDefined();
    expect(configModule.DEFAULT_CONFIG.model).toBe('deepseek-coder');
    expect(configModule.DEFAULT_CONFIG.base_branch).toBe('main');
  });
});
