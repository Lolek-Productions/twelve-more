import { Geist, Geist_Mono } from "next/font/google";
import "./../globals.css";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Loader from "@/components/Loader"
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const appName = process.env.APP_NAME;
const appDescription = process.env.APP_DESCRIPTION

export const metadata = {
  title: appName,
  description: appDescription,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
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
        </ClerkLoaded>
      </body>
    </html>
    </ClerkProvider>
  );
}
