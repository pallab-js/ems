import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xobha Events | Northeast India's Premier Event Management System",
  description: "One-stop enterprise event management platform customized for Assam and Northeast India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="bg-surface-dark py-12 text-on-dark-soft border-t border-hairline/10">
            <div className="container mx-auto px-4 max-w-5xl space-y-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-hairline/10 pb-8">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2 C 12 8, 8 12, 2 12 C 8 12, 12 16, 12 22 C 12 16, 16 12, 22 12 C 16 12, 12 8, 12 2 Z" />
                    </svg>
                    <span className="font-serif text-lg font-normal text-on-dark tracking-tight">
                      Xobha <span className="text-primary font-serif">Events</span>
                    </span>
                  </div>
                  <p className="text-xs max-w-xs leading-relaxed">
                    Celebrating community gatherings and premier experiences across Northeast India.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                  <div className="space-y-2.5">
                    <p className="font-semibold text-on-dark uppercase tracking-wider text-[10px]">Platform</p>
                    <ul className="space-y-2">
                      <li><Link href="/events" className="hover:text-on-dark transition-colors">Browse Events</Link></li>
                      <li><Link href="/register" className="hover:text-on-dark transition-colors">Host an Event</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <p className="font-semibold text-on-dark uppercase tracking-wider text-[10px]">Portal</p>
                    <ul className="space-y-2">
                      <li><Link href="/login" className="hover:text-on-dark transition-colors">Login</Link></li>
                      <li><Link href="/register" className="hover:text-on-dark transition-colors">Register</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div>© {new Date().getFullYear()} Xobha Events. All rights reserved.</div>
                <div>Tailored for Assam & Northeast India.</div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
