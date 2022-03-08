/* RN Performance Plugin setup */
const path = require('path');
const perfPlugins = require(path.resolve('lib/commonjs/plugins'));

perfPlugins.dangerJs();
