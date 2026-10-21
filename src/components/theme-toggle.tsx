import { useTheme } from '../theme';
import { MoonIcon, SunIcon } from './icons';

type ThemeToggleProps = {
  className?: string;
};

const ThemeToggle = ({ className = 'icon-button' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      className={className}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={!isDark}
      onClick={toggleTheme}
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
};

export default ThemeToggle;
