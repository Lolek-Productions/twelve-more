"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"
import {useAppUser} from "@/hooks/useAppUser.js";
import {getOrganizationById} from "@/lib/actions/organization.js";
import {useContextContent} from "@/components/ContextProvider.jsx";
import OrganizationContextSidebar from "@/components/OrganizationContextSidebar";
import OrganizationCommunityList from "@/components/OrganizationCommunityList.jsx";
import {Button} from "@/components/ui/button.jsx";

export default function UserPage() {
  const params = useParams();
  const { organizationId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [communities, setCommunities] = useState(null);
  const { appUser } = useAppUser();

  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<OrganizationContextSidebar />);
  }, [setContextContent]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    async function fetchOrganizationData() {
      try {
        setLoading(true);
        const orgData = await getOrganizationById(organizationId);

        if (orgData.success) {
          setOrganization(orgData.organization);
        }
      } catch (err) {
        setError("Failed to fetch organization data");
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizationData();

  }, [organizationId]);

  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 w-[30rem]">{error}</div>;

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <Link href={`/organizations/${organization?.id}/posts`}>
          <h2 className="text-lg sm:text-xl font-bold">Organization: {organization.name}</h2>
          <div>{organization.description}</div>
        </Link>
      </div>
      <div className={'p-6'}>
        {communities?.length === 0 ? (
          <p className="text-gray-500">No communities yet.</p>
        ) : (
          <div className="mt-2 space-y-2">

            <Button asChild className="mb-4" >
              <Link href={`/organizations/${organization.id}/community/create`}>Create New Community</Link>
            </Button>

            <OrganizationCommunityList organization={organization} />
          </div>
        )}
      </div>
    </>
  );
}
