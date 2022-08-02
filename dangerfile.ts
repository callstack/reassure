/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { dangerJs } from 'reassure';

dangerJs({
  inputFilePath: path.join(__dirname, './examples/native/.reassure/output.md'),
});
