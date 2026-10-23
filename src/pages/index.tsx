import { useTabs } from "../tabs";
import _Editor from "../components/_editor";

const MainPage = () => {
  const { currentFile } = useTabs();

  return <>{currentFile && <_Editor key={currentFile} fpfile={currentFile} />}</>;
};

export default MainPage;
