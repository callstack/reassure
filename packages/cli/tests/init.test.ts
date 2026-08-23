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

  it.each([
    ['npm@11.4.2', 'npm install', 'npm exec -- reassure'],
    ['yarn@4.11.0', 'yarn install', 'yarn reassure'],
    ['bun@1.2.0', 'bun install', 'bun run reassure'],
  ])('uses %s commands when packageManager declares it', (packageManager, installCommand, reassureCommand) => {
    writeFileSync('package.json', JSON.stringify({ packageManager }));

    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain(installCommand);
    expect(script).toContain(`${reassureCommand} --baseline`);
    expect(script).toContain(`${reassureCommand} --branch`);
    expect(script).not.toContain('{{');
    expect(statSync('reassure-tests.sh').mode & 0o111).not.toBe(0);
  });

  it.each([
    ['package-lock.json', 'npm install', 'npm exec -- reassure'],
    ['npm-shrinkwrap.json', 'npm install', 'npm exec -- reassure'],
    ['yarn.lock', 'yarn install', 'yarn reassure'],
    ['bun.lock', 'bun install', 'bun run reassure'],
    ['bun.lockb', 'bun install', 'bun run reassure'],
  ])('uses the matching commands when %s exists', (lockfile, installCommand, reassureCommand) => {
    writeFileSync(lockfile, '');

    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain(installCommand);
    expect(script).toContain(`${reassureCommand} --baseline`);
  });

  it('prefers packageManager over stale lockfiles', () => {
    writeFileSync('package.json', JSON.stringify({ packageManager: 'npm@11.4.2' }));
    writeFileSync('bun.lock', '');

    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain('npm install');
    expect(script).not.toContain('bun install');
  });

  it('defaults to Yarn when no supported package manager is configured', () => {
    run({ silent: true, verbose: false });

    const script = readFileSync('reassure-tests.sh', 'utf8');
    expect(script).toContain('yarn install');
    expect(script).toContain('yarn reassure --baseline');
    expect(script).toContain('yarn reassure --branch');
  });
});
