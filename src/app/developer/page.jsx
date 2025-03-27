"use client";

import { useState, useEffect } from "react";
import {DEV_IDS} from "@/lib/constants";
import { useUser } from "@clerk/nextjs";
import {getPrivateUserById, getUserById} from "@/lib/actions/user";

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        setLoading(true);

        const developerPromises = DEV_IDS.map(async (id) => {
          const result = await getPrivateUserById(id);
          return result.success ? result.user : null;
        });

        const resolvedDevelopers = await Promise.all(developerPromises);
        setDevelopers(resolvedDevelopers);
      } catch (err) {
        console.error("Error fetching developers:", err);
        setError("Failed to load developer data");
      } finally {
        setLoading(false);
      }
    }

    fetchDevelopers();
  }, []);

  useEffect(() => {
    const fetchDbUser = async () => {
      try {
        // console.log('userId to fetch:', user.publicMetadata.userMongoId)
        const response = await fetch("/api/user/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.publicMetadata.userMongoId }),
        });

        if (response.ok) {
          const dbUserData = await response.json();
          setDbUser(dbUserData);
          // console.log("Fetched DB User:", dbUserData);
        }
      } catch (error) {
        console.error("Error fetching DB user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDbUser();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold tracking-tight">Developers</h2>
      <p className="text-muted-foreground mb-4">
        User documents for developers identified by phone numbers from constants.
      </p>

      {developers.length === 0 ? (
        <p>No developers found matching the phone numbers.</p>
      ) : (
        <ul className="space-y-4">
          {developers.map((dev) => (
            <li key={dev.id} className="border p-4 rounded-md">
              <p>
                <strong>Name:</strong>{" "}
                {dev?.firstName && dev?.lastName
                  ? `${dev.firstName} ${dev.lastName}`
                  : "Unknown"}
              </p>
              <p>
                <strong>Phone Number:</strong> {dev?.phoneNumber}
              </p>
              <p>
                <strong>ID:</strong> {dev?.id}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-7">Current Logged In User (you)</h2>
      <div className={'mt-1'}>
        <div>Your UserId from Mongo: {dbUser?._id}</div>
        <div>Your userMongoId from Clerk: {user.publicMetadata.userMongoId}</div>
        <div>Your ClerkId from Mongo: {dbUser?.clerkId}</div>
        <div>Your ClerkId from Clerk: {user.id}</div>
      </div>
      <p className="text-muted-foreground mt-2">
        Note: In production the first two strings should be the same and the second two should be the same. In local
        development, the clerkId will differ since we are using separate instances in Clerk.  Still both instances point to the same user
        document in the production database.
      </p>
    </div>
  );
}