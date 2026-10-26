declare module "*.css";

interface WindowControlsApi {
  minimize(): void;
  maximize(): void;
  close(): void;
}

interface UserFilesApi {
  getFiles(): Promise<import("./interface/FileEntry").default[]>;
  createDirectory(dir_name: string): Promise<void>;
  createFile(file_name: string): Promise<void>;
  deleteFile(file_name: string): Promise<void>;
  deleteDirectory(directory_name: string): Promise<void>;
  getText(fpfile: string): Promise<string>;
  saveText(fpfile: string, text: string): Promise<void>;
  search(query: string): Promise<import("./interface/SearchResult").default>;
}

interface Window {
  windowControls: WindowControlsApi;
  userFiles: UserFilesApi;
}
