"use client";

import { useEffect, useCallback } from "react";
import { useContextContent } from "@/components/ContextProvider";
import ExampleContextComponent from "./ExampleContextSidebar";

export default function ExamplePage() {
  const { setContextContent, clearContextContent } = useContextContent();

  // Create a stable onClose callback that won't change on re-renders
  const handleClose = useCallback(() => {
    clearContextContent();
  }, [clearContextContent]);

  useEffect(() => {
    // Create the context component once when the component mounts
    const ContextComponent = <ExampleContextComponent onClose={handleClose} />;
    setContextContent(ContextComponent);

    // Clean up when the component unmounts
    return () => {
      clearContextContent();
    };
  }, [setContextContent, handleClose]);

  return (
    <div className="p-6">

    </div>
  );
}