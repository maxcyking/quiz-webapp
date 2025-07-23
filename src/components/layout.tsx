import "@fontsource/inter";
import { Header } from "./header";
import { Toaster } from "./ui/toaster";
import { ThemeProvider } from "./theme-provider";
import { DataPrefetcher } from "./data-prefetcher";
import { useExam } from "@/context/exam-context";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAttemptingExam } = useExam();
  
  return (
    <div className="min-h-screen bg-background font-sans">
      <ThemeProvider defaultTheme="system" storageKey="PrepForAll-theme">
        <DataPrefetcher />
        <div className="flex min-h-screen flex-col">
          {/* Hide header when attempting an exam */}
          {!isAttemptingExam && <Header />}
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </ThemeProvider>
    </div>
  );
}