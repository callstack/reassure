import path from 'path';
import dangerJs from './packages/reassure/plugins';

dangerJs({
  inputFilePath: path.join(__dirname, './examples/native/.reassure/output.md'),
});
