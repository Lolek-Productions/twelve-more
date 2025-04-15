"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { getUserById } from "@/lib/actions/user";

// Create a context for managing the app state
const MainContext = createContext(null);

export function MainContextProvider({ children, initialAppUser, initialClerkUser }) {
  const [appUser, setAppUser] = useState(initialAppUser || null);

  // Clerk authentication
  const { user, isSignedIn, isLoaded } = useUser();
  // Use initialClerkUser (from server) or the client-side user
  const clerkUser = initialClerkUser || user;

  // Post and modal state management
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showingPostCommentModal, setShowingPostCommentModal] = useState(false);
  const [showingPostEditModal, setShowingPostEditModal] = useState(false);

  // Fetch user data effect (migrated from SessionInitializer)
  useEffect(() => {
    const fetchAppUser = async () => {
      if (!isLoaded || !user) return; // Wait for Clerk user to load

      // If initialUser is provided (e.g., from server), use it
      if (initialAppUser) {
        setAppUser(initialAppUser);
        return;
      }

      // Fetch from database
      const appUserResponse = await getUserById(user.publicMetadata.userMongoId);

      // Check if the response was successful and extract the user object
      if (appUserResponse.success) {
        setAppUser(appUserResponse.user);
      } else {
        setAppUser(null); // Or handle the error case as needed
      }
    };

    fetchAppUser();
  }, [user, isLoaded, initialAppUser]);

  // Create a stable value object with all needed functions and state
  const contextValue = {
    // User authentication state
    appUser,
    setAppUser,
    clerkUser,
    isSignedIn,
    isLoaded,

    // Post and modal state
    selectedPostId,
    setSelectedPostId,
    showingPostCommentModal,
    setShowingPostCommentModal,
    showingPostEditModal,
    setShowingPostEditModal
  };

  return (
    <MainContext.Provider value={contextValue}>
      {children}
    </MainContext.Provider>
  );
}

// Custom hook to use the context
export function useMainContext() {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMainContext must be used within a MainContextProvider");
  }
  return context;
}