import { useTabs } from "../tabs";
import _Editor from "../components/_editor";

const MainPage = () => {
  const { currentFile, tabs } = useTabs();
  const currentTab = tabs.find((tab) => tab.path === currentFile);

  return (
    <>
      {currentFile && currentTab && (
        <_Editor
          key={currentFile}
          fpfile={currentFile}
          initialLine={currentTab.line}
        />
      )}
    </>
  );
};

export default MainPage;
