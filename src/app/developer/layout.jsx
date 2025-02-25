import Image from "next/image"
import { AdminSidebarNav } from "@/components/AdminSidebarNav"
import {Toaster} from "@/components/ui/toaster";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Developer",
    href: "/developer",
  },
  {
    title: "Send SMS",
    href: "/developer/send-sms", // New route for the SMS page
  },
]

export default function SettingsLayout({ children }) {
  return (
    <div>
      <Toaster />
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
          <h2 className="text-2xl font-bold tracking-tight">TwelveMore Developer</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <AdminSidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </div>
  )
}
