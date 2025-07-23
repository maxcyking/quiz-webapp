import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: false,
  },
      webpack: (config, { isServer }) => {
    // Suppress React 19 ref warnings from external libraries
    if (!isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
      
      // Suppress specific React 19 warnings
      config.ignoreWarnings = [
        /Accessing element.ref was removed in React 19/,
        /ref is now a regular prop/,
        /will be removed from the JSX Element type/,
      ];
      
      // Additional console warning suppression
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (
          message.includes('Accessing element.ref was removed in React 19') ||
          message.includes('ref is now a regular prop') ||
          message.includes('will be removed from the JSX Element type')
        ) {
          return; // Suppress these warnings
        }
        originalConsoleError.apply(console, args);
      };
    }
    return config;
  },
};

export default nextConfig;
