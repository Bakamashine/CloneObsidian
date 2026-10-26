import { getTime } from "../api/time";
import {
  simpleGit,
  type SimpleGit,
  CleanOptions,
  SimpleGitOptions,
} from "simple-git";
import { userFiles } from "../ipcMainHandlers";

const options: Partial<SimpleGitOptions> = {
  baseDir: userFiles,
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};
class Github {
  private remote = "https://github.com/Bakamashine/ObsidianMarkdown.git";

  private git: SimpleGit = simpleGit(options);
  private branch = "master";
  async push() {
    const time = await getTime();
    const timestamp = time?.timestamp;
    if (timestamp) {
      this.git.commit(timestamp.toString()).push(this.remote, this.branch);
    }
  }
  pull() {
    this.git.pull(this.remote, this.branch);
  }
  clone() {
    this.git.clone(this.remote, userFiles);
  }
}

export default new Github();
