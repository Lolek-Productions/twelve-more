'use client';

import { Provider, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { userAtom } from '@/lib/atoms/userAtom';
import { useUser } from '@clerk/nextjs';
import {getUserById} from "@/lib/actions/user";

function SessionInitializer({ initialUser }) {
  const setUser = useSetAtom(userAtom);

  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const fetchAppUser = async () => {
      if (!isLoaded || !user) return; // Wait for Clerk user to load

      // If initialUser is provided (e.g., from server), use it
      if (initialUser) {
        setUser(initialUser);
        return;
      }

      // Fetch from database
      const appUserResponse = await getUserById(user.publicMetadata.userMongoId);

      // Check if the response was successful and extract the user object
      if (appUserResponse.success) {
        setUser(appUserResponse.user); // Set only the 'user' part
      } else {
        console.error('Failed to fetch user:', appUserResponse.error);
        setUser(null); // Or handle the error case as needed
      }
    };

    fetchAppUser();
  }, [user, isLoaded, initialUser, setUser]);

  return null; // This component doesn't render anything
}

export default function SessionWrapper({ children, initialUser }) {
  return (
    <Provider>
      <SessionInitializer initialUser={initialUser} />
      {children}
    </Provider>
  );
}