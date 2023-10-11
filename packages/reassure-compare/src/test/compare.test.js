import { loadFile } from '../compare';

describe('loadFile', () => {
  it('should load results file with header', async () => {
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

  it('should load results file without header', async () => {
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

  it('should fail for file with invalid JSON structure', async () => {
    expect(() => loadFile(`${__dirname}/invalid-json.perf`)).toThrowErrorMatchingSnapshot();
  });

  it('should fail for file with invalid entry', async () => {
    expect(() => loadFile(`${__dirname}/invalid-entry.perf`)).toThrowErrorMatchingSnapshot();
  });

  it('should support entries without type', async () => {
    const results = loadFile(`${__dirname}/default-type.perf`);

    const types = Object.entries(results.entries).map(([key, value]) => value.type);
    expect(types).toEqual(['render', 'render', 'function']);
  });
});
