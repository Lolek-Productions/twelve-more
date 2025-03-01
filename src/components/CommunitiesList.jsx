"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";

export default function CommunitiesList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { appUser } = useAppUser();

  if (loading) {
    return <div className="p-4 w-[30rem]">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 w-[30rem]">
      <h3 className="text-xl font-semibold mb-4">Your Communities</h3>
      {appUser?.communities?.length === 0 ? (
        <div>
          <p>You don’t belong to any communities...yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {appUser?.communities?.map((community) => (
            <li key={community.id} className="border p-4 rounded-md">
              <Link href={`/communities/${community.id}`}>
                <h4 className="text-lg font-medium">{community.name}</h4>
                {/*<p className="text-muted-foreground">{community.id}</p>*/}
                <p className="text-muted-foreground">{community.description}</p>
              </Link>
              <Button
                asChild
                className="mt-2"
                variant="outline"
              >
                <Link href={`/communities/${community.id}/invite`}>
                  Invite others to community
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}