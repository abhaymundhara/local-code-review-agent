import { simpleGit, SimpleGit } from 'simple-git';

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  lineNumber: number;
  content: string;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffFile {
  path: string;
  oldPath?: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffResult {
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  rawDiff: string;
}

export interface DiffOptions {
  base?: string;
  staged?: boolean;
  cwd?: string;
}

export async function getDiff(options: DiffOptions = {}): Promise<DiffResult> {
  const git: SimpleGit = simpleGit(options.cwd ?? process.cwd());

  // Verify this is a git repo
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository. Run this from your project root.');
  }

  let rawDiff: string;

  if (options.staged) {
    // Staged changes only
    rawDiff = await git.diff(['--cached', '--unified=5']);
  } else if (options.base) {
    // Diff against base branch
    rawDiff = await git.diff([options.base, '--unified=5']);
  } else {
    // Working tree changes (unstaged)
    rawDiff = await git.diff(['--unified=5']);
  }

  if (!rawDiff.trim()) {
    return { files: [], totalAdditions: 0, totalDeletions: 0, rawDiff: '' };
  }

  return parseDiff(rawDiff);
}

function parseDiff(rawDiff: string): DiffResult {
  const files: DiffFile[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  // Split into per-file sections
  const fileSections = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const section of fileSections) {
    const lines = section.split('\n');
    const headerLine = lines[0]; // e.g. "a/src/foo.ts b/src/foo.ts"

    // Extract file paths
    const pathMatch = headerLine.match(/a\/(.+?) b\/(.+)$/);
    if (!pathMatch) continue;

    const oldPath = pathMatch[1];
    const newPath = pathMatch[2];

    // Determine status
    let status: DiffFile['status'] = 'modified';
    if (section.includes('\nnew file mode')) status = 'added';
    else if (section.includes('\ndeleted file mode')) status = 'deleted';
    else if (oldPath !== newPath) status = 'renamed';

    // Parse hunks
    const hunks: DiffHunk[] = [];
    let additions = 0;
    let deletions = 0;

    const hunkSections = section.split(/^(@@ .+ @@)/m).slice(1);

    for (let i = 0; i < hunkSections.length; i += 2) {
      const hunkHeader = hunkSections[i];
      const hunkBody = hunkSections[i + 1] ?? '';
      const hunkLines: DiffLine[] = [];

      // Parse header for line numbers: @@ -L,S +L,S @@
      const hunkMatch = hunkHeader.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      let lineNumber = hunkMatch ? parseInt(hunkMatch[1], 10) : 1;

      for (const line of hunkBody.split('\n')) {
        if (line.startsWith('+')) {
          hunkLines.push({ type: 'add', lineNumber, content: line.slice(1) });
          additions++;
          lineNumber++;
        } else if (line.startsWith('-')) {
          hunkLines.push({ type: 'remove', lineNumber, content: line.slice(1) });
          deletions++;
        } else if (line.startsWith(' ')) {
          hunkLines.push({ type: 'context', lineNumber, content: line.slice(1) });
          lineNumber++;
        }
      }

      hunks.push({ header: hunkHeader, lines: hunkLines });
    }

    totalAdditions += additions;
    totalDeletions += deletions;

    files.push({
      path: newPath,
      oldPath: status === 'renamed' ? oldPath : undefined,
      status,
      additions,
      deletions,
      hunks,
    });
  }

  return { files, totalAdditions, totalDeletions, rawDiff };
}
