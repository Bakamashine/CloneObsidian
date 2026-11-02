export type EditorBuffer = {
  text: string;
  savedText: string;
};

const buffers = new Map<string, EditorBuffer>();

const rewritePath = (path: string, from: string, to: string) => {
  if (path === from) return to;
  if (path.startsWith(`${from}/`)) return `${to}${path.slice(from.length)}`;
  return null;
};

export const getEditorBuffer = (path: string) => buffers.get(path);

export const setEditorBuffer = (path: string, buffer: EditorBuffer) => {
  buffers.set(path, buffer);
};

export const deleteEditorBuffer = (path: string) => {
  buffers.delete(path);
};

export const moveEditorBuffers = (from: string, to: string) => {
  if (from === to) return;

  for (const [path, buffer] of Array.from(buffers)) {
    const nextPath = rewritePath(path, from, to);
    if (!nextPath) continue;
    buffers.delete(path);
    buffers.set(nextPath, buffer);
  }
};

export const dropEditorBuffers = (path: string) => {
  for (const bufferedPath of Array.from(buffers.keys())) {
    if (bufferedPath === path || bufferedPath.startsWith(`${path}/`)) {
      buffers.delete(bufferedPath);
    }
  }
};
