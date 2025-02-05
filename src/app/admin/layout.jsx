import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/app/admin/components/sidebar-nav"
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "../globals.css";

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

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/admin",
  },
  {
    title: "Communities",
    href: "/admin/communities",
  },
  {
    title: "Organizations",
    href: "/admin/organizations",
  },
]

export default function SettingsLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="md:hidden">
            <Image
              src="/examples/forms-light.png"
              width={1280}
              height={791}
              alt="Forms"
              className="block dark:hidden"
            />
            <Image
              src="/examples/forms-dark.png"
              width={1280}
              height={791}
              alt="Forms"
              className="hidden dark:block"
            />
          </div>
          <div className="hidden space-y-6 p-10 pb-16 md:block">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">TwelveMore Admin</h2>
              <p className="text-muted-foreground">
                Manage your account settings and set e-mail preferences.
              </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
              <aside className="-mx-4 lg:w-1/5">
                <SidebarNav items={sidebarNavItems} />
              </aside>
              <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
