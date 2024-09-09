import { dirname, resolve } from 'node:path';

export function getJestBinPath() {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const jestPackageJson = require('jest/package.json');
    const jestPackagePath = dirname(require.resolve('jest/package.json'));
    return resolve(jestPackagePath, jestPackageJson.bin.jest || jestPackageJson.bin);
  } catch {
    return null;
  }
}

export function getNodeMajorVersion(): number {
  const version = process.versions.node;
  return parseInt(version.split('.')[0], 10);
}

const COMMON_NODE_FLAGS = [
  // Expose garbage collector to be able to run it manually
  '--expose-gc',
  // Disable concurrent sweeping to make measurements more stable
  '--no-concurrent-sweeping',
  // Increase max memory size to reduce garbage collection frequency
  '--max-old-space-size=4096',
];

export function getNodeFlags(nodeMajorVersion: number): string[] {
  if (nodeMajorVersion < 18) {
    throw new Error('Node.js version 18 or higher is required to run performance tests');
  }

  if (nodeMajorVersion == 18) {
    return [
      ...COMMON_NODE_FLAGS,
      // Disable optimizing compilers, keep the baseline compilers: sparkplug (JS), liftoff (WASM)
      '--no-opt',
    ];
  }

  return [
    ...COMMON_NODE_FLAGS,
    // Disable optimizing compilers, keep the baseline compilers: sparkplug (JS), liftoff (WASM)
    '--max-opt=1',
  ];
}
