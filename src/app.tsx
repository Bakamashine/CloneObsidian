import { HashRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages';
import Layout from './layout';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
