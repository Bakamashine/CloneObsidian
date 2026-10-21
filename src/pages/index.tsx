import { useTabs } from "../tabs";

const MainPage = () => {
  const { currentFile } = useTabs();

  return <p>{currentFile ?? "Welcome"}</p>;
};

export default MainPage;
