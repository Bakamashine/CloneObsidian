import { useSyncExternalStore } from 'react';
import {
  getDirtyEditorPaths,
  getEditorBuffersVersion,
  subscribeEditorBuffers,
} from '../editor-buffers';

export const useDirtyEditorPaths = () => {
  useSyncExternalStore(
    subscribeEditorBuffers,
    getEditorBuffersVersion,
    getEditorBuffersVersion,
  );

  return new Set(getDirtyEditorPaths());
};
