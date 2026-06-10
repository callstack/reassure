#!/usr/bin/env node

const fs = require('fs');

function importLocalReassure() {
  let localBin;

  try {
    localBin = require.resolve('reassure/bin/reassure', {
      paths: [process.cwd()],
    });
  } catch {
    return false;
  }

  if (fs.realpathSync(localBin) === fs.realpathSync(__filename)) {
    return false;
  }

  require(localBin);
  return true;
}

if (!importLocalReassure()) {
  require('@callstack/reassure-cli/bin/reassure');
}
