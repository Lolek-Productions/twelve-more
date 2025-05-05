import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ClerkLoaded, ClerkLoading, ClerkProvider} from '@clerk/nextjs'
import Loader from "@/components/Loader";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: process.env.APP_NAME,
  description: process.env.APP_DESCRIPTION,
};

export default function RootLayout({ children }) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ClerkLoading>
            <Loader />
          </ClerkLoading>
          <ClerkLoaded>
            {children}
          </ClerkLoaded>

          {/* Only render Analytics in production */}
          {isProduction && <Analytics />}
          {isProduction && <SpeedInsights />}
        </body>
      </html>
    </ClerkProvider>
  );
}
