import path from 'path';
import core from '@actions/core';
import { reassureGhAction, reassureGhActionConfig } from './reassureGhAction';

const index = () => {
  const inputFilePath = core.getInput('inputFilePath', { required: false });
  const debug = !!core.getInput('debug', { required: false });

  const defaultInputFilePath = path.join(__dirname, './examples/native/.reassure/output.md');
  const config: reassureGhActionConfig = { inputFilePath: inputFilePath || defaultInputFilePath, debug };
  reassureGhAction(config);
};

export default index;
