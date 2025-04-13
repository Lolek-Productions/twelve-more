"use client";

import { useRef, useEffect } from "react";
import { useContextContent } from "@/components/ContextProvider";

export default function AutoClosingSidebar({ children }) {
  const { setIsRightSheetOpen } = useContextContent();
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Function to handle clicks inside the sidebar
    const handleSidebarClick = (e) => {
      // Check if the click is on an interactive element
      const isClickable = e.target.closest('a, button, [role="button"]');

      // If it's a clickable element, close the sidebar
      if (isClickable) {
        // Small delay to allow the click action to complete
        setTimeout(() => {
          console.log('close the sheet...says the auto closing sidebar wrapper')
          setIsRightSheetOpen(false);
        }, 50);
      }
    };

    // Add click event listener to the sidebar
    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.addEventListener('click', handleSidebarClick);
    }

    // Clean up event listener when component unmounts
    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('click', handleSidebarClick);
      }
    };
  }, [setIsRightSheetOpen]);

  return (
    <div ref={sidebarRef} className="h-full w-full">
      {children}
    </div>
  );
}