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
import { Menu, EllipsisVertical } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MainContextProvider } from "@/components/MainContextProvider";
import { RightSidebarContextProvider, useRightSidebarContextContent } from "@/components/RightSidebarContextProvider.jsx";
import AutoClosingSidebar from "@/components/AutoClosingSidebarWrapper.jsx";
import TanstackQueryProvider from "@/components/TanstackQueryProvider.jsx";
import EditModal from "@/components/EditModal.jsx";

// Inner layout component that has access to the context
function InnerLayout({ children }) {
  const { contentComponent, isRightSheetOpen, setIsRightSheetOpen  } = useRightSidebarContextContent();
  const [isLeftSheetOpen, setIsLeftSheetOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Function to close the left sheet
  const closeLeftSheet = () => setIsLeftSheetOpen(false);

  // Function to close the right sheet
  const closeRightSheet = () => setIsRightSheetOpen(false);

  // Function to handle left sheet open state
  const handleLeftSheetChange = (open) => {
    setIsLeftSheetOpen(open);
    // If opening left sheet, close right sheet
    if (open) setIsRightSheetOpen(false);
  };

  // Function to handle right sheet open state
  const handleRightSheetChange = (open) => {
    setIsRightSheetOpen(open);
    // If opening left sheet, close right sheet
    if (open) setIsLeftSheetOpen(false);
  };

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
    <div className="flex min-h-screen w-full flex-col">
      {/* Mobile Header with Menu Trigger */}
      <header
        className={`fixed top-0 left-0 right-0 z-[60] flex h-16 items-center border-b bg-background px-4 md:hidden transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full">
          <div className="flex items-center justify-between">
            {/* Left Sheet - Menu */}
            <Sheet open={isLeftSheetOpen} onOpenChange={handleLeftSheetChange}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6"/>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 z-[100] mt-0 pt-0">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <LeftSidebar onLinkClick={closeLeftSheet}/>
              </SheetContent>
            </Sheet>

            <div className="font-semibold text-lg">12More</div>

            {/* Right Sheet - Context Info - Only show if content component exists */}
            {contentComponent && (
              <Sheet open={isRightSheetOpen} onOpenChange={handleRightSheetChange}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical className="h-6 w-6"/>
                    <span className="sr-only">Context Information</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0 z-[100] mt-0 pt-0">
                  <VisuallyHidden>
                    <SheetTitle>Context Information</SheetTitle>
                  </VisuallyHidden>
                  {/* Render the dynamic content component in the right sheet on mobile */}
                  <div className="pt-9 px-3 overflow-y-auto max-h-full flex-grow">
                    <AutoClosingSidebar>
                      {contentComponent}
                    </AutoClosingSidebar>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Three-Column Layout */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full mt-16 md:mt-0">
        {/* Left Sidebar - Always visible on desktop */}
        <div className="hidden md:block h-screen sticky top-0 w-64 flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="flex w-full justify-center">
            <div className='min-h-screen w-full max-w-xl md:border-r md:border-l border-gray-200'>
              {children}
            </div>
          </div>
        </div>

        {/* Right Context Column - Only on desktop and only if content exists */}
        {contentComponent && (
          <div className="hidden md:block h-screen top-0 w-64 flex-shrink-0 overflow-y-auto">
            {contentComponent}
          </div>
        )}
      </div>

      {/* Modals and Toasts */}
      <CommentModal />
      <EditModal />
      <Toaster />
    </div>
  );
}

// Outer layout component that provides the context
export default function RootLayout({ children }) {
  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <MainContextProvider>
          <TanstackQueryProvider>
            <RightSidebarContextProvider>
              <InnerLayout>{children}</InnerLayout>
            </RightSidebarContextProvider>
          </TanstackQueryProvider>
        </MainContextProvider>
      </SignedIn>
    </div>
  );
}