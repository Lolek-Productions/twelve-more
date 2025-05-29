"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { onboardDeveloperAction } from "./onboardDeveloperAction";
import { useApiToast } from "@/lib/utils";
import { useMainContext } from "@/components/MainContextProvider.jsx";
import { MainContextProvider } from "@/components/MainContextProvider.jsx";

/**
 * Developer Onboarding Page
 * @returns {JSX.Element}
 */
function OnboardDeveloperPage() {
  const { showResponseToast, showErrorToast } = useApiToast();
  const { appUser, clerkUser } = useMainContext();

  const handleOnboard = async () => {
    try {
      const result = await onboardDeveloperAction({
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        phoneNumber: clerkUser.phoneNumber,
        clerkId: clerkUser.id,
      });
      console.log('result', result)
    } catch (err) {
      console.error('error', err)
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 flex flex-col gap-1">
      <h1 className="text-2xl font-bold mb-6">Developer Onboarding</h1>
      <h2 className="text-lg font-semibold mb-2">Your Account in Clerk - often referred to as clerkUser</h2>
      {clerkUser ? (
        <div className="mb-4 flex items-center gap-3">
          {clerkUser.imageUrl && (
            <img src={clerkUser.imageUrl} alt="User avatar" className="w-10 h-10 rounded-full" />
          )}
          <div>
            <div className="font-semibold">{clerkUser.fullName || clerkUser.username}</div>
            <div className="text-sm text-muted-foreground">{clerkUser.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-sm text-destructive">No Clerk user found for this account.</div>
      )}

      <h2 className="text-lg font-semibold mb-2">Your Account in MongoDB - commonly referred to as appUser</h2>
      {appUser ? (
        <div className="mb-4 flex items-center gap-3">
          {appUser.imageUrl && (
            <img src={appUser.imageUrl} alt="User avatar" className="w-10 h-10 rounded-full" />
          )}
          <div>
            <div className="font-semibold">{appUser.firstName || appUser.lastName}</div>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-sm text-destructive">No MongoDB user found for this account.</div>
      )}

      <div className="mb-6 p-4 rounded bg-blue-50 border border-blue-200 text-blue-900">
        <h3 className="font-semibold mb-1">About Clerk & Developer Onboarding</h3>
        <p className="mb-1">
          <span className="font-semibold">Clerk</span> is our authentication provider, ensuring your identity is secure and consistent across the app.
        </p>
        <p className="mb-1">
          The onboarding process links your Clerk account to a MongoDB profile (appUser), enabling you to access developer features and collaborate within the platform.
        </p>
        <p className="mb-1">
          Clicking this button will essentially perform the same task that the webhook does.
        </p>
        <p className="mb-0.5">
          After clicking <span className="font-semibold">Handle Developer Onboarding</span>, your accounts will be synchronized. If you encounter any issues, please say a prayer and contact fr.josh@lolekproductions.org.
        </p>
      </div>

      <Button onClick={handleOnboard}>Handle Developer Onboarding</Button>

      {clerkUser && appUser && (
        <Button asChild className="mt-4">
          <a href="/home">Go Home</a>
        </Button>
      )}
    </div>
  );
}


// Outer layout component that provides the context
export default function RootLayout({ children }) {
  return (
    <div>
      <MainContextProvider>
        <OnboardDeveloperPage>{children}</OnboardDeveloperPage>
      </MainContextProvider>
    </div>
  );
}