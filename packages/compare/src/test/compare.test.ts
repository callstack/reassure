import { copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compare, loadFile } from '../compare';

afterEach(() => jest.restoreAllMocks());

describe('loadFile', () => {
  it('should load results file with header', () => {
    const results = loadFile(`${__dirname}/valid-header.perf`);

    expect(results.metadata).toEqual({
      branch: 'feat/perf-file-validation',
      commitHash: '991427a413b1ff05497a881287c9ddcba7b8de54',
    });

    const entries = Object.keys(results.entries);
    expect(entries).toHaveLength(5);
    expect(entries).toEqual([
      'Other Component 10',
      'Other Component 10 legacy scenario',
      'Other Component 20',
      'Async Component',
      'fib 30',
    ]);
    expect(results).toMatchSnapshot();
  });

  it('should load results file without header', () => {
    const results = loadFile(`${__dirname}/valid-no-header.perf`);

    expect(results.metadata).toBeUndefined();

    const entries = Object.keys(results.entries);
    expect(entries).toHaveLength(5);
    expect(entries).toEqual([
      'Other Component 10',
      'Other Component 10 legacy scenario',
      'Other Component 20',
      'Async Component',
      'fib 30',
    ]);
    expect(results).toMatchSnapshot();
  });

  it('should fail for file with invalid JSON structure', () => {
    expect(() => loadFile(`${__dirname}/invalid-json.perf`)).toThrowErrorMatchingSnapshot();
  });

  it('should fail for file with invalid entry', () => {
    expect(() => loadFile(`${__dirname}/invalid-entry.perf`)).toThrowErrorMatchingSnapshot();
  });

  it('should support entries without type', () => {
    const results = loadFile(`${__dirname}/default-type.perf`);

    const types = Object.entries(results.entries).map(([_, value]) => value.type);
    expect(types).toEqual(['render', 'render', 'function']);
  });
});

describe('compare output directory', () => {
  it('uses REASSURE_OUTPUT_DIR for default inputs and outputs', async () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), 'reassure-output-'));
    const previousOutputDirectory = process.env.REASSURE_OUTPUT_DIR;
    copyFileSync(`${__dirname}/valid-no-header.perf`, join(outputDirectory, 'baseline.perf'));
    copyFileSync(`${__dirname}/valid-no-header.perf`, join(outputDirectory, 'current.perf'));
    process.env.REASSURE_OUTPUT_DIR = outputDirectory;
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    try {
      await compare({ outputFormat: 'all' });
      expect(existsSync(join(outputDirectory, 'output.json'))).toBe(true);
      expect(existsSync(join(outputDirectory, 'output.md'))).toBe(true);
    } finally {
      if (previousOutputDirectory === undefined) delete process.env.REASSURE_OUTPUT_DIR;
      else process.env.REASSURE_OUTPUT_DIR = previousOutputDirectory;
      rmSync(outputDirectory, { recursive: true, force: true });
    }
  });
});
