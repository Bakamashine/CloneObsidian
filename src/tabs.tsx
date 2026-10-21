import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Tab = {
  name: string;
  path: string;
};

type TabsState = {
  tabs: Tab[];
  currentFile: string | null;
};

type TabsContextValue = TabsState & {
  openTab: (tab: Tab) => void;
  closeTab: (path: string) => void;
  closeAllTabs: () => void;
  setCurrentFile: (path: string | null) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TabsState>({
    tabs: [],
    currentFile: null,
  });

  const openTab = useCallback((tab: Tab) => {
    setState((prev) => ({
      tabs: prev.tabs.some((t) => t.path === tab.path)
        ? prev.tabs
        : [...prev.tabs, tab],
      currentFile: tab.path,
    }));
  }, []);

  const closeTab = useCallback((path: string) => {
    setState((prev) => {
      const index = prev.tabs.findIndex((t) => t.path === path);
      if (index === -1) return prev;
      const tabs = prev.tabs.filter((t) => t.path !== path);
      const currentFile =
        prev.currentFile === path
          ? (tabs[Math.min(index, tabs.length - 1)]?.path ?? null)
          : prev.currentFile;
      return { tabs, currentFile };
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setState({ tabs: [], currentFile: null });
  }, []);

  const setCurrentFile = useCallback((path: string | null) => {
    setState((prev) => ({ ...prev, currentFile: path }));
  }, []);

  const value = useMemo(
    () => ({ ...state, openTab, closeTab, closeAllTabs, setCurrentFile }),
    [state, openTab, closeTab, closeAllTabs, setCurrentFile],
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
};

export default TabsProvider;
