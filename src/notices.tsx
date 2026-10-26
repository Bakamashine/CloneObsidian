import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type NoticeKind = 'success' | 'error' | 'info';

type Notice = {
  id: number;
  message: string;
  kind: NoticeKind;
};

type NoticesApi = {
  notify: (message: string, kind?: NoticeKind) => void;
};

const NOTICE_TIMEOUT = 4000;

const NoticesContext = createContext<NoticesApi | null>(null);

export const NoticesProvider = ({ children }: { children: ReactNode }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: NoticeKind = 'info') => {
      const id = nextId.current;
      nextId.current += 1;
      setNotices((current) => [...current, { id, message, kind }]);
      window.setTimeout(() => dismiss(id), NOTICE_TIMEOUT);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <NoticesContext.Provider value={api}>
      {children}
      <div className="notices" role="status" aria-live="polite">
        {notices.map((notice) => (
          <button
            key={notice.id}
            className={`notice notice--${notice.kind}`}
            type="button"
            title="Dismiss"
            onClick={() => dismiss(notice.id)}
          >
            {notice.message}
          </button>
        ))}
      </div>
    </NoticesContext.Provider>
  );
};

export const useNotices = () => {
  const context = useContext(NoticesContext);
  if (!context) {
    throw new Error('useNotices must be used within a NoticesProvider');
  }
  return context;
};
