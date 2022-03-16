import path from 'path';
import dangerJs from './plugins';
import type { Config } from './src/plugins/dangerjs';

dangerJs({
  inputFilePath: path.join(__dirname, './example/analyser-output.md'),
} as Config);
