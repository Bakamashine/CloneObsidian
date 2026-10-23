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

export type ViewMode = "edit" | "preview";

type TabsState = {
  tabs: Tab[];
  currentFile: string | null;
  viewMode: ViewMode;
};

type TabsContextValue = TabsState & {
  openTab: (tab: Tab) => void;
  closeTab: (path: string) => void;
  closeAllTabs: () => void;
  setCurrentFile: (path: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TabsState>({
    tabs: [],
    currentFile: null,
    viewMode: "edit",
  });

  const openTab = useCallback((tab: Tab) => {
    setState((prev) => ({
      ...prev,
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
      return { ...prev, tabs, currentFile };
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setState((prev) => ({ ...prev, tabs: [], currentFile: null }));
  }, []);

  const setCurrentFile = useCallback((path: string | null) => {
    setState((prev) => ({ ...prev, currentFile: path }));
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleViewMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "edit" ? "preview" : "edit",
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      openTab,
      closeTab,
      closeAllTabs,
      setCurrentFile,
      setViewMode,
      toggleViewMode,
    }),
    [
      state,
      openTab,
      closeTab,
      closeAllTabs,
      setCurrentFile,
      setViewMode,
      toggleViewMode,
    ],
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
