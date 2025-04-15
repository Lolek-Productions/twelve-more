"use client";

import { createContext, useContext, useState, useCallback } from "react";

// Create a context for managing the right sidebar/column content
const ContextSidebarContext = createContext(null);

export function RightSidebarContextProvider({ children }) {
  // State to track which content component to render (for both sidebar and third column)
  const [contentComponent, setContentComponent] = useState(null);

  // Add state for controlling the right sheet visibility
  const [isRightSheetOpen, setIsRightSheetOpen] = useState(false);

  // Use useCallback to create stable function references
  const setRightSidebarContextContent = useCallback((component) => {
    setContentComponent(component);
  }, []);

  const clearContextContent = useCallback(() => {
    setContentComponent(null);
    setIsRightSheetOpen(false);
  }, []);

  // Add function to close the sheet without clearing content
  const closeContextContent = useCallback(() => {
    setIsRightSheetOpen(false);
  }, []);

  // Create a stable value object with all needed functions and state
  const contextValue = {
    contentComponent,
    setRightSidebarContextContent,
    clearContextContent,
    closeContextContent,
    isRightSheetOpen,
    setIsRightSheetOpen
  };

  return (
    <ContextSidebarContext.Provider value={contextValue}>
      {children}
    </ContextSidebarContext.Provider>
  );
}

// Custom hook to use the context
export function useRightSidebarContextContent() {
  const context = useContext(ContextSidebarContext);
  if (!context) {
    throw new Error("useContextContent must be used within a RightSidebarContextProvider");
  }
  return context;
}