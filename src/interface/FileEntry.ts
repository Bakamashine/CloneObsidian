type FileEntry = {
  name: string;
  kind: 'file' | 'folder';
  depth?: number;
};

export default FileEntry;
