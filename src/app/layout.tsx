import type React from "react"
import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import "@/lib/suppress-react19-warnings"
import { ExamProvider } from "@/context/exam-context"
import ClientProviders from "@/components/client-providers"
import DataPrefetcher from "@/components/data-prefetcher"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"]
})

export const metadata: Metadata = {
  title: {
    default: "Quiz App",
    template: "%s | Quiz App"
  },
  description: "A comprehensive quiz application for exams and assessments",
  keywords: ["quiz", "exam", "assessment", "education", "learning"],
  authors: [{ name: "Quiz App Team" }],
  creator: "Quiz App",
  metadataBase: new URL("https://quizapp.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quizapp.com",
    title: "Quiz App",
    description: "A comprehensive quiz application for exams and assessments",
    siteName: "Quiz App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz App",
    description: "A comprehensive quiz application for exams and assessments",
    creator: "@quizapp",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(270 100% 98%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(240 15% 8%)" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <ExamProvider>
            <SidebarProvider>
              <AppSidebar />
              <div className="flex-1 md:ml-64">
                <Header />
                <main className="min-h-screen">
                  {children}
                </main>
              </div>
              <Toaster />
              <DataPrefetcher />
            </SidebarProvider>
          </ExamProvider>
        </ClientProviders>
      </body>
    </html>
  )
}