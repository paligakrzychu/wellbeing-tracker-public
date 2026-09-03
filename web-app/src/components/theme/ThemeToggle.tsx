"use client";

import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div data-testid="theme-selector" className="flex items-center gap-1">
      <button
        type="button"
        data-testid="theme-dark"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
        className={
          theme === "dark"
            ? "rounded-lg px-2 py-1 text-xs font-medium bg-slate-700 text-white"
            : "rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
        }
      >
        Dark
      </button>
      <button
        type="button"
        data-testid="theme-light"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
        className={
          theme === "light"
            ? "rounded-lg px-2 py-1 text-xs font-medium bg-slate-200 text-slate-800"
            : "rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
        }
      >
        Light
      </button>
    </div>
  );
}
