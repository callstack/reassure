import { dirname, resolve } from 'node:path';

export function getJestBinPath() {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const jestPackageJson = require('jest/package.json');
    const jestPackagePath = dirname(require.resolve('jest/package.json'));
    return resolve(jestPackagePath, jestPackageJson.bin.jest || jestPackageJson.bin);
  } catch (error) {
    return null;
  }
}

export function getNodeMajorVersion(): number {
  const version = process.versions.node;
  return parseInt(version.split('.')[0], 10);
}

const COMMON_NODE_FLAGS = ['--expose-gc', '--no-concurrent-sweeping', '--max-old-space-size=4096'];

export function getNodeFlags(nodeMajorVersion: number): string[] {
  if (nodeMajorVersion < 18) {
    throw new Error('Node.js version 18 or higher is required to run performance tests');
  }

  if (nodeMajorVersion == 18) {
    return [...COMMON_NODE_FLAGS, '--no-opt'];
  }

  return [...COMMON_NODE_FLAGS, '--max-opt=1'];
}
