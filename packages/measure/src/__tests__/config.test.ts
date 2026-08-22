import { join } from 'node:path';

describe('default output file', () => {
  const originalOutputDirectory = process.env.REASSURE_OUTPUT_DIR;
  const originalOutputFile = process.env.REASSURE_OUTPUT_FILE;

  afterEach(() => {
    if (originalOutputDirectory === undefined) delete process.env.REASSURE_OUTPUT_DIR;
    else process.env.REASSURE_OUTPUT_DIR = originalOutputDirectory;

    if (originalOutputFile === undefined) delete process.env.REASSURE_OUTPUT_FILE;
    else process.env.REASSURE_OUTPUT_FILE = originalOutputFile;

    jest.resetModules();
  });

  it('uses REASSURE_OUTPUT_DIR when REASSURE_OUTPUT_FILE is not set', () => {
    process.env.REASSURE_OUTPUT_DIR = 'custom-results';
    delete process.env.REASSURE_OUTPUT_FILE;

    jest.isolateModules(() => {
      const { config } = require('../config');
      expect(config.outputFile).toBe(join('custom-results', 'current.perf'));
    });
  });

  it('prefers REASSURE_OUTPUT_FILE over REASSURE_OUTPUT_DIR', () => {
    process.env.REASSURE_OUTPUT_DIR = 'custom-results';
    process.env.REASSURE_OUTPUT_FILE = 'explicit/current.perf';

    jest.isolateModules(() => {
      const { config } = require('../config');
      expect(config.outputFile).toBe('explicit/current.perf');
    });
  });
});
