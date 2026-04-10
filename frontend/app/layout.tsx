import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { AuthProvider } from "@/lib/auth-context";
import { NavigationBar } from "@/components/custom/NavigationBar";
import { Toaster } from "@/components/ui/sonner"


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <Auth0Provider>
          <AuthProvider>
            <ThemeProvider>
              <NavigationBar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </main>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </Auth0Provider>
      </body>
    </html>
  )
}
