"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"
import {useAppUser} from "@/hooks/useAppUser.js";
import {getOrganizationById} from "@/lib/actions/organization.js";
import {getCommunitiesByOrganizationForUser} from "@/lib/actions/community.js";
import {useContextContent} from "@/components/ContextProvider.jsx";
import OrganizationContextSidebar from "@/components/OrganizationContextSidebar";

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


  useEffect(() => {
    if (!organizationId) {
      return;
    }

    async function fetchCommunities() {
      try {
        const comData = await getCommunitiesByOrganizationForUser(organizationId, appUser);
        // console.log("communities data", comData);

        if (comData.success) {
          setCommunities(comData.communities);
        } else {
          setError("Communities not found");
        }
      } catch (err) {
        setError("Failed to fetch communities");
      }
    }
    fetchCommunities();
  }, [organizationId]);


  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 w-[30rem]">{error}</div>;

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Organization: {organization.name}</h2>
        <div>{organization.description}</div>
      </div>
      <div className={'p-6'}>
        <h3 className="text-lg font-semibold">Communities ({communities?.length})</h3>
        {communities?.length === 0 ? (
          <p className="text-gray-500">No communities yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {communities?.map((community) => (
              <div key={community.id} className="px-2 rounded-md flex justify-start items-center">
                <Link className={'flex gap-3 items-center'} href={`/communities/${community?.id}`}>
                  <div className="">{`${community?.name}` || "Unknown"}</div>
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full align-middle">
                    {community?.visibility
                      ? community.visibility.charAt(0).toUpperCase() + community.visibility.slice(1)
                      : ""}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
