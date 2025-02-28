"use client";

import { useState } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import CommentModal from "@/components/CommentModal";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function RootLayout({ children }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State to control Sheet

  // Function to close the Sheet
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex min-h-screen w-full flex-col">
          {/* Mobile Header with Menu Trigger */}
          <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                    <div className="font-semibold text-lg">TwelveMore</div>
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <LeftSidebar onLinkClick={closeSheet} /> {/* Pass close function */}
              </SheetContent>
            </Sheet>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 justify-between max-w-6xl mx-auto">
            {/* Left Sidebar - Hidden on mobile, visible on md+ */}
            <div className="hidden md:inline border-r h-screen sticky top-0 w-64 flex-shrink-0">
              <LeftSidebar /> {/* No need for onLinkClick on desktop */}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full">{children}</main>

            {/* Right Sidebar - Hidden on lg and below */}
            <div className="hidden lg:flex lg:flex-col p-3 h-screen border-l w-[24rem] flex-shrink-0">
              <RightSidebar />
            </div>
          </div>

          {/* Modals and Toasts */}
          <CommentModal />
          <Toaster />
        </div>
      </SignedIn>
    </div>
  );
}