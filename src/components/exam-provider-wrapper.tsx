"use client";

import { ExamProvider } from "@/context/exam-context";
import { usePathname } from "next/navigation";

// Pages that don't need exam context
const publicPages = ['/', '/login', '/register'];

export default function ExamProviderWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const location = usePathname();
  
  // Check if current page is a public page
  const isPublicPage = publicPages.includes(location);
  
  // For public pages, skip initializing Firebase and other heavy resources
  if (isPublicPage) {
    return <>{children}</>;
  }
  
  // For authenticated pages, use the full ExamProvider
  return <ExamProvider>{children}</ExamProvider>;
}