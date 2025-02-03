import "./../globals.css";
import Loader from "@/components/Loader"
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs'

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
