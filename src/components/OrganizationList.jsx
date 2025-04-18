"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrganizationCommunityList from "@/components/OrganizationCommunityList.jsx";
import React from "react";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function OrganizationList() {
  const { appUser } = useMainContext();

  return (
    <div className="p-4">
      <Button asChild className="mb-4" >
        <Link href={`/organizations/create`}>Create New Organization</Link>
      </Button>

      {appUser?.organizations.length === 0 ? (
        <p>You don't belong to any organizations...yet</p>
      ) : (
        <>
          {appUser?.organizations.map((organization) => {
            return (
              <div key={organization.id} className={'pb-4 pt-1'}>
                <div className="flex justify-between items-center py-2">
                  <Link href={`/organizations/${organization.id}`}>
                    <div className="text-lg font-semibold">{organization.name}</div>
                  </Link>
                  <Button asChild size="small">
                    <Link
                      className={'py-1 px-2'}
                      href={`/organizations/${organization.id}/community/create`}
                    >
                      New Community
                    </Link>
                  </Button>
                </div>
                <OrganizationCommunityList key={organization.id} organization={organization} />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
