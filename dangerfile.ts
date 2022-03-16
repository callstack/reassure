import path from 'path';
import dangerJs from './plugins';
import type { DangerJsConfig } from './src/plugins/';

dangerJs({
  inputFilePath: path.join(__dirname, './example/analyser-output.md'),
} as DangerJsConfig);
