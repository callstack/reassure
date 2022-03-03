const path = require('path');
const pak = require('../package.json');

module.exports = {
  root: true,
  extends: '@callstack/eslint-config',
  settings: {
    'import/core-modules': [
      'rn-perf-tool',
      'escape-string-regexp',
      'metro-config/src/defaults/exclusionList',
    ],
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src/'],
      },
      alias: {
        map: [
          ['rn-perf-tool', path.join(__dirname, '..', pak.source)],
          ['components', './src/components'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.tsx', '.json'],
      },
    },
  },
};
