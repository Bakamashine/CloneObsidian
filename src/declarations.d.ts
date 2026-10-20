declare module '*.css';

interface WindowControlsApi {
  minimize(): void;
  maximize(): void;
  close(): void;
}

interface UserFilesApi {
  getFiles(): Promise<import('./interface/FileEntry').default[]>;
}

interface Window {
  windowControls: WindowControlsApi;
  userFiles: UserFilesApi;
}
