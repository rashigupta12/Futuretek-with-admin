// src/app/layout.tsx
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Futuretek Institute Of Astrological Sciences",
  description: "Expert-led courses in KP Astrology, Financial Astrology, Vastu Shastra, and Astro-Vastu.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Preload critical resources */}
          <link rel="preconnect" href="/api" />
          <link rel="dns-prefetch" href="/api" />
          {/* <link rel="preload" href="/images/hero-bg.jpg" as="image" /> */}
          <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        </head>
        <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>
          <Providers>
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </Providers>
        </body>
      </html>
    </SessionProvider>
  );
}