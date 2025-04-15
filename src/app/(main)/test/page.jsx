"use client";

import { useMainContext } from "@/components/MainContextProvider";

export default function ExamplePage() {
  const { appUser, clerkUser } = useMainContext();

  return (
    <div className="p-6">
      {appUser ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome appUser, {appUser.firstName }</h1>
          <h1 className="text-2xl font-bold mb-4">Welcome clerkUser, {clerkUser.firstName }</h1>
          <p>You're signed in with ID: {appUser.id}</p>

          {/* Example of using both auth contexts */}
          {clerkUser && (
            <p className="mt-2 text-gray-600">
              Email: {clerkUser.primaryEmailAddress?.emailAddress}
            </p>
          )}
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Loading user data...</h1>
        </div>
      )}
    </div>
  );
}