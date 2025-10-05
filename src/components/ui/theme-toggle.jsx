"use client";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window === "undefined") return "light";
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      return "light";
    }
  });

  // avoid rendering theme-dependent UI until after mount to prevent
  // hydration mismatches between server and client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-input/10 rounded-lg transition-colors duration-200"
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )
      ) : (
        // placeholder to keep DOM stable during SSR -> hydration
        <span className="w-4 h-4 inline-block" aria-hidden />
      )}
      <span className="font-medium">
        {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
      </span>
    </button>
  );
}
