"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = usePathname();

  useEffect(() => {
    // Reset loading state when Next.js route changes
    setLoading(false);
    setProgress(100);
    
    const timeout = setTimeout(() => {
      setProgress(0);
    }, 400);
    
    return () => clearTimeout(timeout);
  }, [location]);

  useEffect(() => {
    let startNavigation: number | null = null;
    let animationFrame: number | null = null;

    const handleStart = () => {
      setLoading(true);
      setProgress(0);
      startNavigation = Date.now();
      
      const animateProgress = () => {
        if (!startNavigation) return;
        
        const elapsedTime = Date.now() - startNavigation;
        const nextProgress = Math.min(elapsedTime / 3000 * 100, 90);
        setProgress(nextProgress);
        
        animationFrame = requestAnimationFrame(animateProgress);
      };
      
      animationFrame = requestAnimationFrame(animateProgress);
    };

    const handleComplete = () => {
      setProgress(100);
      startNavigation = null;
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 400);
    };

    window.addEventListener("beforeunload", handleStart);
    window.addEventListener("load", handleComplete);
    
    // Event listener for click events on links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith('javascript:') && !link.target) {
        handleStart();
      }
    };
    
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      window.removeEventListener("load", handleComplete);
      document.removeEventListener('click', handleLinkClick);
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-primary z-[100] transition-transform duration-300",
        loading ? "opacity-100" : "opacity-0 transition-opacity duration-300"
      )}
      style={{
        transform: `translateX(${progress - 100}%)`,
      }}
    />
  );
}