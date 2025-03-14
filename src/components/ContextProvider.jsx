"use client";

import { createContext, useContext, useState, useCallback } from "react";

// Create a context for managing the right sidebar/column content
const ContextSidebarContext = createContext(null);

export function ContextProvider({ children }) {
  // State to track which content component to render (for both sidebar and third column)
  const [contentComponent, setContentComponent] = useState(null);

  // Use useCallback to create stable function references
  const setContextContent = useCallback((component) => {
    setContentComponent(component);
  }, []);

  const clearContextContent = useCallback(() => {
    setContentComponent(null);
  }, []);

  // Create a stable value object
  const contextValue = {
    contentComponent,
    setContextContent,
    clearContextContent,
  };

  return (
    <ContextSidebarContext.Provider value={contextValue}>
      {children}
    </ContextSidebarContext.Provider>
  );
}

// Custom hook to use the context
export function useContextContent() {
  const context = useContext(ContextSidebarContext);
  if (!context) {
    throw new Error("useContextContent must be used within a ContextProvider");
  }
  return context;
}