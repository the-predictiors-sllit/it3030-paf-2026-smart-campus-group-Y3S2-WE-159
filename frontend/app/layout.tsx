import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { NavigationBar } from "@/components/custom/NavigationBar";
import { Toaster } from "@/components/ui/sonner"
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login?returnTo=/');
  }

  try {
    await auth0.getAccessToken();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    const requiresReauth =
      errorMessage.includes('AccessTokenError') ||
      (errorMessage.includes('expired') && errorMessage.includes('refresh token'));

    if (requiresReauth) {
      redirect('/auth/login?returnTo=/');
    }

    throw error;
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>
            <NavigationBar />
            <main className="max-w-9xl mx-auto px-0 sm:px-2 lg:px-4">
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
