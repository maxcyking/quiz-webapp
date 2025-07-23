"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useExam } from "@/context/exam-context";

// Pages that don't need prefetching
const publicPages = ['/', '/login', '/register'];

export function DataPrefetcher() {
  const pathname = usePathname();
  const { user } = useExam();
  
  // Basic route prefetching without requiring auth context
  useEffect(() => {
    // Only prefetch if user is authenticated
    if (!user) return;

    // Skip for public pages
    if (publicPages.includes(pathname)) {
      return;
    }
    
    // Next.js will handle component loading automatically
    
  }, [pathname, user]);

  return null;
}

export default DataPrefetcher;