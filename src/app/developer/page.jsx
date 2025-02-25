"use client";

import { useState, useEffect } from "react";
import { DEV_PHONE_NUMBERS } from "@/lib/constants"; // Import developer phone numbers
import { getUserByPhoneNumber } from "@/lib/actions/user"; // Import server action

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        setLoading(true);

        // Fetch users for each phone number in DEV_PHONE_NUMBERS
        const developerPromises = DEV_PHONE_NUMBERS.map(async (phoneNumber) => {
          const result = await getUserByPhoneNumber(phoneNumber);
          return result.success ? result.data : null;
        });

        // Resolve all promises and filter out null results (users not found)
        const resolvedDevelopers = await Promise.all(developerPromises);
        const validDevelopers = resolvedDevelopers.filter(dev => dev !== null);

        setDevelopers(validDevelopers);
      } catch (err) {
        console.error("Error fetching developers:", err);
        setError("Failed to load developer data");
      } finally {
        setLoading(false);
      }
    }

    fetchDevelopers();
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
                {dev.firstName && dev.lastName
                  ? `${dev.firstName} ${dev.lastName}`
                  : "Unknown"}
              </p>
              <p>
                <strong>Phone Number:</strong> {dev.phoneNumber}
              </p>
              <p>
                <strong>ID:</strong> {dev.id}
              </p>
              {/* Add more fields as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}