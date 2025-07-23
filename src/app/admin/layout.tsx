"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authInitialized } = useExam();

  useEffect(() => {
    if (authInitialized && !loading && (!user || !user.isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, loading, authInitialized, router]);

  // Show loading state while checking authentication
  if (!authInitialized || loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Don't render admin panel if user is not an admin
  if (!user?.isAdmin) {
    return null;
  }

  // Get current tab from pathname
  let currentTab = pathname?.split('/')[2] || 'exams';
  
  // For the root admin path, set to 'exams'
  if (pathname === '/admin') {
    currentTab = 'exams';
  }
  
  // Map the exams path to the 'manage-exams' tab
  else if (currentTab === 'exams' && pathname !== '/admin') {
    currentTab = 'manage-exams';
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      <Tabs value={currentTab} className="mb-8">
        <TabsList className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap">
          <TabsTrigger 
            value="exams" 
            onClick={() => router.push("/admin")}
            className="cursor-pointer"
          >
            Create Exams
          </TabsTrigger>
          <TabsTrigger 
            value="manage-exams" 
            onClick={() => router.push("/admin/exams")}
            className="cursor-pointer"
          >
            Manage Exams
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            onClick={() => router.push("/admin/questions")}
            className="cursor-pointer"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger 
            value="registrations" 
            onClick={() => router.push("/admin/registrations")}
            className="cursor-pointer"
          >
            Registrations
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            onClick={() => router.push("/admin/categories")}
            className="cursor-pointer"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            onClick={() => router.push("/admin/users")}
            className="cursor-pointer"
          >
            Users
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}