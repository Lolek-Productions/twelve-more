import { Geist, Geist_Mono } from "next/font/google";
import "./../globals.css";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Loader from "@/components/Loader"
import CommentModal from "@/components/CommentModal"
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs'
import SessionWrapper from "@/components/SessionWrapper";

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
  return (
    <ClerkProvider>
      <SessionWrapper>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ClerkLoading>
              <Loader />
            </ClerkLoading>
            <ClerkLoaded>
              <div className='flex justify-between max-w-6xl mx-auto'>
              {/* hidden sm:inline */}
                <div className='inline border-r h-screen sticky top-0'>
                  <LeftSidebar />
                </div>
                <div className='w-2xl flex-1'>
                  {children}
                </div>
                <div className='lg:flex-col p-3 h-screen border-l hidden lg:flex w-[24rem]'>
                  <RightSidebar />
                </div>
              </div>
              <CommentModal />
            </ClerkLoaded>
          </body>
        </html>
      </SessionWrapper>
    </ClerkProvider>
  );
}
