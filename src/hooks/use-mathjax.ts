import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    MathJax: any;
    mathJaxReady: boolean;
  }
}

export function useMathJax() {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkMathJax = () => {
      if (typeof window !== 'undefined' && window.MathJax && window.mathJaxReady) {
        setIsReady(true);
      }
    };

    // Check if MathJax is already ready
    checkMathJax();

    // Listen for MathJax ready event
    const handleMathJaxReady = () => {
      setIsReady(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mathjax-ready', handleMathJaxReady);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mathjax-ready', handleMathJaxReady);
      }
    };
  }, []);

  const renderMath = async (element: HTMLElement | null) => {
    if (!element || !isReady || !window.MathJax) {
      return;
    }

    try {
      setIsProcessing(true);
      // Use MathJax 3.x typesetPromise API
      await window.MathJax.typesetPromise([element]);
    } catch (error) {
      console.error('MathJax rendering error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMathInDocument = async () => {
    if (!isReady || !window.MathJax) {
      return;
    }

    try {
      setIsProcessing(true);
      // Use MathJax 3.x typesetPromise API for full document
      await window.MathJax.typesetPromise();
    } catch (error) {
      console.error('MathJax document rendering error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isReady,
    isProcessing,
    renderMath,
    renderMathInDocument
  };
}

export function useMathJaxRenderer(content: string, deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { renderMath, isReady } = useMathJax();
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (isReady && containerRef.current && content && !hasRendered) {
      renderMath(containerRef.current).then(() => {
        setHasRendered(true);
      });
    }
  }, [isReady, content, hasRendered, renderMath, ...deps]);

  // Re-render when dependencies change
  useEffect(() => {
    if (isReady && containerRef.current && hasRendered) {
      setHasRendered(false);
    }
  }, deps);

  return containerRef;
}
