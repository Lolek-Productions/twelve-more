"use client";

import { useEffect, useState } from "react";
import { CommandsTable } from "./commands-table";

export default function DeveloperPage() {
  const [data, setData] = useState([
    { id: "1", name: "Create Josh in Clerk" },
    { id: "2", name: "Delete Josh in Clerk" },
    { id: "3", name: "Send Test Email" },
  ]);

  useEffect(() => {
    // Optionally fetch commands from an API here
    // For now, using static data
  }, []);

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Developer Commands</h3>
          <p className="text-sm text-muted-foreground">
            Run developer actions for TwelveMore.
          </p>
        </div>
      </div>
      <div className="mt-3">
        <CommandsTable data={data} />
      </div>
    </div>
  );
}