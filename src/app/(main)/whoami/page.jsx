"use client";
import { useMainContext } from "@/components/MainContextProvider.jsx";

export default function WhoAmI() {
  const { appUser, clerkUser, isLoaded } = useMainContext();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading user info...</div>;
  }

  if (!clerkUser) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">No Clerk user found. Please sign in.</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="mt-8 max-w-2xl mx-auto p-4 bg-white rounded-lg shadow space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Clerk User Info</h2>
            <ul className="list-disc pl-5">
              <li><strong>ID:</strong> {clerkUser.id}</li>
              <li><strong>Name:</strong> {clerkUser.firstName} {clerkUser.lastName}</li>
              <li><strong>Phone:</strong> {clerkUser.primaryPhoneNumber?.phoneNumber || 'N/A'}</li>
              <li>
                <strong>Metadata:</strong>
                {clerkUser.publicMetadata ? (
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#f3f4f6", padding: "0.5em", borderRadius: "0.25em", maxWidth: 400, overflowX: "auto" }}>
                    {JSON.stringify(clerkUser.publicMetadata, null, 2)}
                  </pre>
                ) : 'N/A'}
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">App User Info</h2>
            {appUser ? (
              <ul className="list-disc pl-5">
                <li><strong>ID:</strong> {appUser._id || appUser.id}</li>
                <li><strong>Name:</strong> {appUser.firstName} {appUser.lastName}</li>
                <li><strong>Phone:</strong> {appUser.phone || 'N/A'}</li>
                <li><strong>Clerk Id:</strong> {appUser.clerkId || 'N/A'}</li>
              </ul>
            ) : (
              <div className="text-yellow-600">No appUser found for this Clerk user.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}