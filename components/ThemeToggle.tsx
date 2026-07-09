"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  const toggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // storage may be unavailable (private mode) — fine, theme still applies this session
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? "切換到淺色主題" : "切換到深色主題"}
      title={isDark ? "淺色主題" : "深色主題"}
    >
      <span className={styles.icon} aria-hidden="true">
        {mounted && !isDark ? (
          // moon (currently light → offer dark)
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          // sun (currently dark → offer light)
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
            </g>
          </svg>
        )}
      </span>
    </button>
  );
}
