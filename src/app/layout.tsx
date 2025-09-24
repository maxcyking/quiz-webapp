import type React from "react"
import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import "@/lib/suppress-react19-warnings"
import { ExamProvider } from "@/context/exam-context"
import ClientProviders from "@/components/client-providers"
import DataPrefetcher from "@/components/data-prefetcher"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ConditionalLayout from "@/components/conditional-layout"

// MathJax configuration will be handled via Script components

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
  other: {
    // Preconnect to Firebase and external services
    "preconnect": "https://firebaseapp.com",
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
      <head>
        <link 
          rel="preload" 
          href="/fonts/inter-var.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preconnect" 
          href="https://firebaseapp.com" 
        />
        <link 
          rel="preconnect" 
          href="https://firebaseinstallations.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://apis.google.com" 
        />
      </head>
      <body className={inter.className}>
        {/* MathJax 3.x Configuration Script */}
        <Script
          id="mathjax-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                window.MathJax = {
                  tex: {
                    inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
                    displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']],
                    processEscapes: true,
                    processEnvironments: true,
                    packages: {'[+]': ['ams', 'newcommand', 'configmacros', 'color', 'cancel', 'base']},
                    macros: {
                      frac: ['\\\\frac{#1}{#2}', 2],
                      times: '\\\\times',
                      cdot: '\\\\cdot',
                      div: '\\\\div'
                    }
                  },
                  svg: {
                    fontCache: 'global',
                    scale: 1.2,
                    minScale: 0.5,
                    mtextInheritFont: true,
                    merrorInheritFont: true,
                    mathmlSpacing: false,
                    skipAttributes: {}
                  },
                  options: {
                    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                    ignoreHtmlClass: 'tex2jax_ignore',
                    processHtmlClass: 'tex2jax_process',
                    // IMPORTANT: Process content even inside span tags
                    processClass: 'math-tex|tex2jax_process'
                  },
                startup: {
                  ready: function () {
                    console.log('MathJax 3.x optimized for Testbook content loaded!');
                    MathJax.startup.defaultReady();
                    if (typeof window !== 'undefined') {
                      window.mathJaxReady = true;
                      window.dispatchEvent(new Event('mathjax-ready'));
                      
                      // Enhanced global helper for math reprocessing
                      window.reprocessMath = function(container) {
                        if (window.MathJax && MathJax.typesetPromise) {
                          const element = container || document.body;
                          console.log('🔄 Reprocessing math in:', element);
                          return MathJax.typesetPromise([element]).then(() => {
                            console.log('✅ Math reprocessed successfully');
                          }).catch((err) => {
                            console.error('❌ MathJax processing error:', err);
                          });
                        }
                        return Promise.resolve();
                      };
                      
                      // Helper specifically for Testbook extracted content
                      window.displayTestbookContent = function(extractedHTML, containerId) {
                        const container = document.getElementById(containerId || 'content-container');
                        if (container) {
                          container.innerHTML = extractedHTML;
                          // Add processing class
                          container.classList.add('tex2jax_process');
                          window.reprocessMath(container);
                        }
                      };
                      
                      // Auto-process any existing math content on page load
                      setTimeout(() => {
                        console.log('🚀 Auto-processing existing math content...');
                        window.reprocessMath();
                      }, 1000);
                    }
                  }
                }
              };
            `
          }}
        />
        
        {/* Polyfill for older browsers */}
        <Script
          src="https://polyfill.io/v3/polyfill.min.js?features=es6"
          strategy="beforeInteractive"
        />
        
        {/* MathJax 3.x Main Script */}
        <Script
          id="MathJax-script"
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          strategy="beforeInteractive"
        />

        <ClientProviders>
          <ExamProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
            <DataPrefetcher />
          </ExamProvider>
        </ClientProviders>
      </body>
    </html>
  )
}