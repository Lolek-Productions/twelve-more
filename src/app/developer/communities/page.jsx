"use client";

import { useState, useEffect } from "react";
import { CommunityTable } from "./community-table.jsx";
import { getAllCommunities } from "@/lib/actions/community";
import {Breadcrumb} from "@/components/ui/breadcrumb";


export default function DeveloperCommunitiesPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const communities = await getAllCommunities();
      setData(communities);
    } catch (error) {
      console.error(error);
    }
  }

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { label: `Organizations` }, // Last item, no href
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Organizations</h3>
          <p className="text-sm text-muted-foreground">Globally manage the 12More organizations.</p>
        </div>
        {/*<Button onClick={() => setModalOpen(true)}>New Organization</Button>*/}
      </div>
      <div className="mt-3">
        <CommunityTable data={data} />
      </div>
    </div>
  );
}