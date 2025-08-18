'use client';

import { useEffect } from 'react';

export default function ConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Store original console methods
      const originalWarn = console.warn;
      const originalInfo = console.info;

      // Patterns to suppress (only non-actionable warnings)
      const suppressPatterns = [
        /\[Deprecation\] -ms-high-contrast.*deprecated/,
        /Download the React DevTools for a better development experience/,
        /was preloaded using link preload but not used within a few seconds/,
        /Unchecked runtime\.lastError.*Could not establish connection/,
        /Module not found: Error: Can't resolve 'next-flight-client-entry-loader'/,
        /Module not found: Error: Can't resolve '\.\/node_modules\/next\/dist\/client\/app-next-dev\.js'/,
        /Module not found: Error: Can't resolve '.*react-refresh-utils.*'/,
        /GET.*__nextjs_font.*404 \(Not Found\)/,
        /net::ERR_ABORTED 404.*__nextjs_font/,
        /\[Fast Refresh\] rebuilding/,
      ];

      // Filter function
      const shouldSuppress = (message: string): boolean => {
        return suppressPatterns.some(pattern => pattern.test(message));
      };

      // Override console.warn only
      console.warn = (...args) => {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
          originalWarn.apply(console, args);
        }
      };

      // Override console.info for specific dev-only banner
      console.info = (...args) => {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
          originalInfo.apply(console, args);
        }
      };

      // Cleanup on unmount
      return () => {
        console.warn = originalWarn;
        console.info = originalInfo;
      };
    }
  }, []);

  return null;
}
