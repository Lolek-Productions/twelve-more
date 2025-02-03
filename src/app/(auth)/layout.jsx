import "./../globals.css";
import Loader from "@/components/Loader"
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs'

export const metadata = {
  title: process.env.APP_NAME,
  description: process.env.APP_DESCRIPTION,
};

export default function RootLayout({ children }) {
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
        </body>
      </html>
    </ClerkProvider>
  )
}
