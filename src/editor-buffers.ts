export type EditorBuffer = {
  text: string;
  savedText: string;
};

const buffers = new Map<string, EditorBuffer>();
const listeners = new Set<() => void>();
let version = 0;

const notify = () => {
  version += 1;
  for (const listener of listeners) listener();
};

const rewritePath = (path: string, from: string, to: string) => {
  if (path === from) return to;
  if (path.startsWith(`${from}/`)) return `${to}${path.slice(from.length)}`;
  return null;
};

export const subscribeEditorBuffers = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getEditorBuffersVersion = () => version;

export const getDirtyEditorPaths = () => Array.from(buffers.keys());

export const getEditorBuffer = (path: string) => buffers.get(path);

export const setEditorBuffer = (path: string, buffer: EditorBuffer) => {
  const wasBuffered = buffers.has(path);
  buffers.set(path, buffer);
  if (!wasBuffered) notify();
};

export const deleteEditorBuffer = (path: string) => {
  if (buffers.delete(path)) notify();
};

export const moveEditorBuffers = (from: string, to: string) => {
  if (from === to) return;

  let changed = false;

  for (const [path, buffer] of Array.from(buffers)) {
    const nextPath = rewritePath(path, from, to);
    if (!nextPath) continue;
    buffers.delete(path);
    buffers.set(nextPath, buffer);
    changed = true;
  }

  if (changed) notify();
};

export const dropEditorBuffers = (path: string) => {
  let changed = false;

  for (const bufferedPath of Array.from(buffers.keys())) {
    if (bufferedPath === path || bufferedPath.startsWith(`${path}/`)) {
      buffers.delete(bufferedPath);
      changed = true;
    }
  }

  if (changed) notify();
};
