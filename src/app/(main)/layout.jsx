"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "@/components/LeftSidebar";
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
import SessionWrapper from "@/components/SessionWrapper";

export default function RootLayout({ children }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Function to close the Sheet
  const closeSheet = () => setIsSheetOpen(false);

  // Track scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add a threshold to prevent tiny movements from triggering
      if (Math.abs(currentScrollY - lastScrollY) < 10) return;

      if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      } else if (currentScrollY > 50) { // Only hide after scrolling down a bit
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <SessionWrapper>
          <div className="flex min-h-screen w-full flex-col">
            {/* Mobile Header with Menu Trigger */}
            <header
              className={`sticky top-0 z-[60] flex h-16 items-center border-b bg-background px-4 md:hidden transition-transform duration-300 ${
                showHeader ? "translate-y-0" : "-translate-y-full"
              }`}
            >
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6"/>
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
                  <LeftSidebar onLinkClick={closeSheet}/>
                </SheetContent>
              </Sheet>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 justify-between max-w-6xl mx-auto">


              {/* Left Sidebar - Hidden on mobile, visible on md+ */}
              <div className="hidden md:block border-r h-screen sticky top-0 w-64 flex-shrink-0">
                <LeftSidebar />
              </div>

              {children}

            </div>

            {/* Modals and Toasts */}
            <CommentModal />
            <Toaster />
          </div>
        </SessionWrapper>
      </SignedIn>
    </div>
  );
}