import { getTime } from '../api/time';
import { simpleGit, type SimpleGit, type SimpleGitOptions } from 'simple-git';
import { userFiles } from '../backend/paths';

const options: Partial<SimpleGitOptions> = {
  baseDir: userFiles,
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
};

class Github {
  private remote = 'https://github.com/Bakamashine/ObsidianMarkdown.git';

  private git: SimpleGit = simpleGit(options);

  private async currentBranch(): Promise<string> {
    return (await this.git.revparse(['--abbrev-ref', 'HEAD'])).trim();
  }

  async push(): Promise<string> {
    const timestamp = await getTime()
      .then((time) => time.timestamp)
      .catch(() => Math.floor(Date.now() / 1000));

    await this.git.add(['-A']);
    const status = await this.git.status();
    if (status.staged.length > 0) {
      await this.git.commit(timestamp.toString());
    }

    const result = await this.git.push(this.remote, await this.currentBranch());
    const pushed =
      result.update !== undefined ||
      result.pushed.some((item) => !item.alreadyUpdated);
    return pushed
      ? 'Pushed changes to the repository.'
      : 'Nothing new to push.';
  }

  async pull(): Promise<string> {
    const result = await this.git.pull(this.remote, await this.currentBranch());
    return result.summary.changes > 0
      ? `Pulled ${result.summary.changes} changed file(s).`
      : 'Already up to date.';
  }

  async clone(): Promise<string> {
    await this.git.clone(this.remote, userFiles);
    return 'Repository cloned.';
  }
}

export default new Github();
