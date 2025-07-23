// React 19 Warning Suppressor
// This file suppresses React 19 ref warnings during development

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress React 19 ref warnings
    if (
      message.includes('Accessing element.ref was removed in React 19') ||
      message.includes('ref is now a regular prop') ||
      message.includes('will be removed from the JSX Element type in a future release') ||
      message.includes('elementRefGetterWithDeprecationWarning')
    ) {
      return; // Don't log these warnings
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };
}
