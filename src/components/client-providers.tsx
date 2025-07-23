"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

// Internal component that uses navigation
function NavigationHandler() {
  const router = useRouter();

  // Handle any global navigation logic here if needed
  // Global navigation logic for Next.js

  return null;
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NavigationHandler />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}