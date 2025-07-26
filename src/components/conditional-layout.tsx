"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current page should exclude sidebar
  const isExamAttemptPage = pathname?.includes("/exams/") && pathname?.includes("/attempt");
  const isExamDetailPage = pathname?.startsWith("/exams/") && !pathname?.includes("/attempt");

  // Full-screen layout for exam attempt pages (no sidebar, no header)
  if (isExamAttemptPage) {
    return (
      <div className="min-h-screen bg-canva-gradient">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // Layout with header but no sidebar for exam detail pages
  if (isExamDetailPage) {
    return (
      <div className="min-h-screen bg-canva-gradient">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] w-full">
          {children}
        </main>
      </div>
    );
  }

  // Default layout with sidebar and header for all other pages
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 md:ml-64">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 