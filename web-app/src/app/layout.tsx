import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeContext";
import ThemeToggle from "../components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "Wellbeing Tracker",
  description: "Free-text wellbeing remarks on your personal timeline",
};

const themeScript = `
(function(){try{var t=localStorage.getItem('theme-preference');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <div className="mx-auto max-w-2xl px-4 py-10">
            <div className="mb-4 flex justify-end">
              <ThemeToggle />
            </div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
