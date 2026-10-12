import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("core-systems-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };
  return { dark, toggle };
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('core-systems-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`;