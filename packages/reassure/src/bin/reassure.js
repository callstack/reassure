#!/usr/bin/env node

const importLocal = require('import-local');

if (!importLocal(__filename)) {
  require('@callstack/reassure-cli/bin/reassure');
}
