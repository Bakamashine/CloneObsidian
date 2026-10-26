type FileEntry = {
  name: string;
  kind: "file" | "folder";
  path: string;
  depth?: number;
};

export default FileEntry;
