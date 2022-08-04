/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { dangerPlugin } from 'reassure';

dangerPlugin({
  inputFilePath: path.join(__dirname, './examples/native/.reassure/output.md'),
});
