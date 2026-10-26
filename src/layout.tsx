import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './components/header';
import Sidebar from './components/sidebar';

const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 'f'
      ) {
        event.preventDefault();
        navigate('/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [navigate]);

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
