// Development console filter to suppress known warnings that are not actionable
export const setupConsoleFilter = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;

    // Patterns to suppress
    const suppressPatterns = [
      /\[Deprecation\] -ms-high-contrast/,
      /Download the React DevTools/,
      /Unchecked runtime\.lastError.*Could not establish connection/,
      /The resource.*was preloaded.*but not used/,
    ];

    // Filter function
    const shouldSuppress = (message: string): boolean => {
      return suppressPatterns.some(pattern => pattern.test(message));
    };

    // Override console methods
    console.warn = (...args) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalWarn.apply(console, args);
      }
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalError.apply(console, args);
      }
    };

    // Keep log as is for debugging
    console.log = originalLog;

    console.info('🧹 Console filter active - suppressing known non-actionable warnings');
  }
};