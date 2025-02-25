import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { AdminSidebarNav } from "@/components/AdminSidebarNav";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {Toaster} from "@/components/ui/toaster";

export default function SettingsLayout({
                                         title = "TwelveMore",
                                         description = "",
                                         sidebarNavItems = [],
                                         children,
                                       }) {
  return (
    <div>
      <Toaster />

      {/* Mobile Header with Menu Trigger */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
                <div className="font-semibold text-lg">{title}</div>
              </div>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <VisuallyHidden>
              <SheetTitle>{title} Navigation</SheetTitle>
            </VisuallyHidden>
            <AdminSidebarNav items={sidebarNavItems} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen w-full flex-col">
        {/* Desktop Layout - Hidden on mobile, visible on md+ */}
        <div className="hidden md:block space-y-6 p-10 pb-16">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <AdminSidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">{children}</div>
          </div>
        </div>

        {/* Mobile Content - Visible on mobile, hidden on md+ */}
        <main className="md:hidden flex-1 p-4">{children}</main>
      </div>

      {/* Mobile Fallback Images (optional) */}
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
    </div>
  );
}