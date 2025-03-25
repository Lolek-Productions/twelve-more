"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAppUser } from '@/hooks/useAppUser';
import OrganizationCommunityList from "@/components/OrganizationCommunityList.jsx";

export default function OrganizationList() {
  const { appUser } = useAppUser();

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
                <Link href={`/organizations/${organization.id}`}>
                  <div className="text-lg font-semibold">{organization.name}</div>
                </Link>
                <OrganizationCommunityList key={organization.id} organization={organization} />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
