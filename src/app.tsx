import { HashRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages';
import Layout from './layout';
import TabsProvider from './tabs';
import { ThemeProvider } from './theme';

const App = () => {
  return (
    <ThemeProvider>
      <TabsProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MainPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </TabsProvider>
    </ThemeProvider>
  );
};

export default App;
