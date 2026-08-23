import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { run } from '../src/commands/init';

describe('reassure init package manager support', () => {
  const originalCwd = process.cwd();
  let testDirectory: string;

  beforeEach(() => {
    testDirectory = mkdtempSync(path.join(tmpdir(), 'reassure-init-'));
    process.chdir(testDirectory);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDirectory, { force: true, recursive: true });
  });

  it('uses Bun commands when packageManager declares Bun', () => {
    writeFileSync('package.json', JSON.stringify({ packageManager: 'bun@1.2.0' }));

    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain('bun install');
    expect(script).toContain('bun run reassure --baseline');
    expect(script).toContain('bun run reassure --branch');
    expect(script).not.toContain('yarn ');
    expect(statSync('reassure-tests.sh').mode & 0o111).not.toBe(0);
  });

  it.each(['bun.lock', 'bun.lockb'])('uses Bun commands when %s exists', (lockfile) => {
    writeFileSync(lockfile, '');

    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain('bun install');
    expect(script).toContain('bun run reassure --baseline');
  });

  it('keeps Yarn commands when Bun is not configured', () => {
    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain('yarn install');
    expect(script).toContain('yarn reassure --baseline');
    expect(script).toContain('yarn reassure --branch');
  });
});
