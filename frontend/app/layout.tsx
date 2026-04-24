import { Geist_Mono, Inter } from "next/font/google"

import { AIAccessBtn } from "@/components/custom/AIAccessBtn"
import FooterSection from "@/components/custom/FooterSection"
import NavBarNew from "@/components/custom/NavBarNew"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="relative">
        <AuthProvider>
          <ThemeProvider>
            {/* <NavigationBar /> */}
            <nav className="sticky top-0 z-40">
              <NavBarNew />
            </nav>
            <div className="fixed bottom-5 right-5 z-40">
              <AIAccessBtn />
            </div>
            <main className="max-w-8xl mx-auto">{children}</main>
            <footer>
              <FooterSection />
            </footer>

            <Toaster position="bottom-left"/>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
