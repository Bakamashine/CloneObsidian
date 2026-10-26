import { HashRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages';
import SearchPage from './pages/search';
import Layout from './layout';
import TabsProvider from './tabs';
import { ThemeProvider } from './theme';
import { NoticesProvider } from './notices';

const App = () => {
  return (
    <ThemeProvider>
      <NoticesProvider>
        <TabsProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </TabsProvider>
      </NoticesProvider>
    </ThemeProvider>
  );
};

export default App;
