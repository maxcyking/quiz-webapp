"use client";

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Global window type extensions for MathJax functions
declare global {
  interface Window {
    reprocessMath?: (container?: HTMLElement) => Promise<void>;
    displayTestbookContent?: (html: string, containerId?: string) => void;
  }
}

interface MathContentProps {
  content: string;
  className?: string;
  fallbackToText?: boolean;
  inline?: boolean;
}

// MINIMAL processing for Testbook math content - Let MathJax handle everything
function prepareContentForMathJax(html: string): string {
  if (!html) return '';
  
  console.log('🔍 RAW INPUT (Testbook format):', html);
  
  // ONLY fix double-escaped LaTeX from JSON (\\( -> \() - MathJax handles the rest
  let processed = html
    .replace(/\\\\(\(|\[)/g, '\\$1')  // \\( -> \( and \\[ -> \[
    .replace(/\\\\(\)|\])/g, '\\$1'); // \\) -> \) and \\] -> \]
  
  console.log('✅ MINIMAL processing - MathJax will handle spans and styling:', processed);
  return processed;
}

// Fallback function to convert LaTeX to readable text
function convertLatexToText(content: string): string {
  let text = content;

  // Handle fractions
  text = text.replace(/\\\((.*?)\\\)/g, (match, expr) => {
    return expr
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\^(\{[^}]+\}|\w+)/g, '^$1')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/[{}]/g, '');
  });

  text = text.replace(/\\\[(.*?)\\\]/g, (match, expr) => {
    return expr
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\^(\{[^}]+\}|\w+)/g, '^$1')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/[{}]/g, '');
  });

  return text;
}

export function MathContent({ 
  content, 
  className, 
  fallbackToText = true,
  inline = false 
}: MathContentProps) {
  const [processedContent, setProcessedContent] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mathReady, setMathReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if MathJax is ready
  useEffect(() => {
    const checkMathJax = () => {
      if (typeof window !== 'undefined' && window.MathJax && window.MathJax.startup) {
        setMathReady(true);
      } else {
        // Listen for MathJax ready event
        const handleMathJaxReady = () => setMathReady(true);
        window.addEventListener('mathjax-ready', handleMathJaxReady);
        return () => window.removeEventListener('mathjax-ready', handleMathJaxReady);
      }
    };
    
    checkMathJax();
  }, []);

  // Process content when it changes
  useEffect(() => {
    if (!content) {
      setProcessedContent('');
      return;
    }

    const prepared = prepareContentForMathJax(content);
    setProcessedContent(prepared);
    setShowFallback(false);
    setIsProcessing(true);
    
    console.log('🔧 Content ready for processing:', prepared);
  }, [content]);

  // Trigger MathJax processing when content is ready and MathJax is available
  useEffect(() => {
    if (!processedContent || !mathReady || !containerRef.current) {
      setIsProcessing(false);
      return;
    }

    const processMath = async () => {
      try {
        console.log('🔄 Starting MathJax processing...');
        
        if (window.MathJax && window.MathJax.typesetPromise && containerRef.current) {
          await window.MathJax.typesetPromise([containerRef.current]);
          console.log('✅ MathJax processing completed successfully');
        } else if (window.reprocessMath && containerRef.current) {
          await window.reprocessMath(containerRef.current);
        } else {
          // Instead of throwing error, just log warning and show fallback if enabled
          console.warn('⚠️ MathJax not available, content will display as plain HTML');
          if (fallbackToText) {
            setShowFallback(true);
          }
        }
      } catch (error) {
        console.error('❌ MathJax processing failed:', error);
        if (fallbackToText) {
          setShowFallback(true);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(processMath, 100);
    return () => clearTimeout(timer);
  }, [processedContent, mathReady, fallbackToText]);

  // Fallback check
  useEffect(() => {
    if (!processedContent || !fallbackToText || isProcessing || showFallback) return;

    const timer = setTimeout(() => {
      if (containerRef.current) {
        // Check for MathJax 3.x processed elements
        const mathElements = containerRef.current.querySelectorAll('mjx-container, .MathJax, mjx-math');
        const hasLatex = processedContent.includes('\\(') || processedContent.includes('\\[');
        
        if (mathElements.length === 0 && hasLatex) {
          console.warn('⚠️ MathJax rendering timeout, showing fallback text');
          setShowFallback(true);
        }
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, [processedContent, fallbackToText, isProcessing, showFallback]);

  if (showFallback && fallbackToText) {
    return (
      <div className={cn("math-fallback text-gray-700 dark:text-gray-300", className)}>
        {convertLatexToText(processedContent)}
      </div>
    );
  }

  if (!processedContent) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "math-content tex2jax_process",
        inline ? "inline-math" : "block-math",
        isProcessing && "opacity-70 transition-opacity",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

// Specialized components for different use cases
export function QuestionMath({ content, className }: { content: string; className?: string }) {
  return (
    <MathContent 
      content={content} 
      className={cn("question-math", className)}
      fallbackToText={true}
    />
  );
}

export function OptionMath({ content, className }: { content: string; className?: string }) {
  return (
    <MathContent 
      content={content} 
      className={cn("option-math", className)}
      fallbackToText={true}
      inline={true}
    />
  );
}

export function SolutionMath({ content, className }: { content: string; className?: string }) {
  return (
    <MathContent 
      content={content} 
      className={cn("solution-math", className)}
      fallbackToText={true}
    />
  );
}
