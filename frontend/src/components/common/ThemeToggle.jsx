import { MoonStar, SunMedium } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleTheme } from '../../redux/slices/uiSlice';

export function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className="ring-focus inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white/50 text-muted transition hover:text-ink dark:bg-slate-900/50"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
    </button>
  );
}
