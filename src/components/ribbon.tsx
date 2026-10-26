import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookIcon,
  CloneIcon,
  PullIcon,
  PushIcon,
  SearchIcon,
  TagIcon,
} from './icons';
import ThemeToggle from './theme-toggle';
import { useNotices } from '../notices';

const formatError = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return `${fallback} ${error.message.split('\n')[0]}`;
  }
  return fallback;
};

const Ribbon = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { notify } = useNotices();

  const runSync = async (action: () => Promise<string>, fallback: string) => {
    try {
      notify(await action(), 'success');
    } catch (error) {
      notify(formatError(error, fallback), 'error');
    }
  };

  return (
    <nav className="ribbon">
      <button
        className={
          pathname === '/'
            ? 'ribbon__button ribbon__button--active'
            : 'ribbon__button'
        }
        type="button"
        title="Files"
        onClick={() => navigate('/')}
      >
        <BookIcon />
      </button>
      <button
        className={
          pathname === '/search'
            ? 'ribbon__button ribbon__button--active'
            : 'ribbon__button'
        }
        type="button"
        title="Search notes (Ctrl+Shift+F)"
        onClick={() => navigate('/search')}
      >
        <SearchIcon />
      </button>
      <button className="ribbon__button" type="button" title="Tags">
        <TagIcon />
      </button>
      <div className="ribbon__spacer" />
      <button
        className="ribbon__button"
        type="button"
        title="Push"
        onClick={() => runSync(window.sync.push, 'Push failed.')}
      >
        <PushIcon />
      </button>
      <button
        className="ribbon__button"
        type="button"
        title="Pull"
        onClick={() => runSync(window.sync.pull, 'Pull failed.')}
      >
        <PullIcon />
      </button>
      <button
        className="ribbon__button"
        type="button"
        title="Clone"
        onClick={() => runSync(window.sync.clone, 'Clone failed.')}
      >
        <CloneIcon />
      </button>
      <ThemeToggle className="ribbon__button" />
    </nav>
  );
};

export default Ribbon;
