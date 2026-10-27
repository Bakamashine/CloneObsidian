import { exec, spawn } from "child_process";
import { userFiles } from "./paths";
const _TerminalFunc = () => {
  const open = () => {
    // TODO: Only for windows
    let terminal_name = "powershell.exe";
    const command = `start ${terminal_name} -NoExit -Command "cd '${userFiles}'"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
    });
  };
  return { open };
};

export default _TerminalFunc;
