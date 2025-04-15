"use client";

import { useEffect, useCallback } from "react";
import { useRightSidebarContextContent } from "@/components/RightSidebarContextProvider.jsx";
import ExampleContextComponent from "./ExampleContextSidebar";

export default function ExamplePage() {
  const { setRightSidebarContextContent, clearContextContent } = useRightSidebarContextContent();

  // Create a stable onClose callback that won't change on re-renders
  const handleClose = useCallback(() => {
    clearContextContent();
  }, [clearContextContent]);

  useEffect(() => {
    // Create the context component once when the component mounts
    const ContextComponent = <ExampleContextComponent onClose={handleClose} />;
    setRightSidebarContextContent(ContextComponent);

    // Clean up when the component unmounts
    return () => {
      clearContextContent();
    };
  }, [setRightSidebarContextContent, handleClose]);

  return (
    <div className="p-6">

    </div>
  );
}