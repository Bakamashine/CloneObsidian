import { Outlet } from 'react-router-dom';
import Header from './components/header';
import Sidebar from './components/sidebar';

const Layout = () => {
  return (
    <div className="app">
      <Sidebar />
      <div className="pane">
        <Header />
        <main className="editor">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
