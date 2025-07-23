"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

// Navigation handler component
function NavigationHandler() {
  const router = useRouter();
  // Add any global navigation logic here if needed
  return null;
}

export default function ClientProvider({
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
    </ThemeProvider>
  );
}