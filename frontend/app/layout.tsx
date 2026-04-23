import { Geist_Mono, Inter } from "next/font/google"

import { NavigationBar } from "@/components/custom/NavigationBar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { auth0 } from "@/lib/auth0"
import { cn } from "@/lib/utils"
import { redirect } from "next/navigation"
import "./globals.css"
import NavBarNew from "@/components/custom/NavBarNew"
import FooterSection from "@/components/custom/FooterSection"
import { AIAccessBtn } from "@/components/custom/AIAccessBtn"

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
  const session = await auth0.getSession()
  if (!session?.user) {
    redirect("/auth/login?returnTo=/")
  }

  try {
    await auth0.getAccessToken()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ""
    const requiresReauth =
      errorMessage.includes("AccessTokenError") ||
      (errorMessage.includes("expired") &&
        errorMessage.includes("refresh token"))

    if (requiresReauth) {
      redirect("/auth/login?returnTo=/")
    }

    throw error
  }

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
