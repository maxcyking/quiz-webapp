"use client";

import { useTheme } from "next-themes";

export function ThemeTest() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Theme Test</h2>
      <p className="mb-2">Current theme: <strong>{theme}</strong></p>
      <div className="flex gap-2">
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded-md"
          onClick={() => setTheme("light")}
        >
          Light
        </button>
        <button 
          className="px-3 py-1 bg-gray-800 text-white rounded-md"
          onClick={() => setTheme("dark")}
        >
          Dark
        </button>
        <button 
          className="px-3 py-1 bg-gray-300 text-black rounded-md"
          onClick={() => setTheme("system")}
        >
          System
        </button>
      </div>
    </div>
  );
}