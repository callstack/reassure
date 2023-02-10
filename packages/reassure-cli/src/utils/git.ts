import simpleGit from 'simple-git';
import { logger } from '@callstack/reassure-logger';

export async function getGitBranch() {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return undefined;
    }

    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim() ? branch : undefined;
  } catch (error) {
    logger.warn('Failed to detect git branch', error);
    return undefined;
  }
}

export async function getGitCommitHash() {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return undefined;
    }

    const commitHash = await git.revparse(['HEAD']);
    return commitHash.trim() ? commitHash : undefined;
  } catch (error) {
    logger.warn('Failed to detect git commit hash', error);
    return undefined;
  }
}
