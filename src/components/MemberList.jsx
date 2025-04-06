'use client';

import Link from "next/link"
import {Button} from "@/components/ui/button.jsx";
import React from "react";
import VisibilityLabel from "@/components/VisibilityLabel.jsx";

export default function MemberList({ community, members, hideInvite = false }) {

  return (
    <div className="mt-3 text-gray-700 space-y-3 bg-gray-100 rounded-xl py-2">
      <div className={'items-center flex flex-col px-4'}>

        <h4 className="font-bold text-xl text-center">
          Community Members:{" "}
          <Link href={`/communities/${community?.id}/posts`}>
            {community?.name}{" "}
          </Link>
          <VisibilityLabel visibility={community?.visibility} />
        </h4>

        {!hideInvite && (<Button asChild className="mt-3">
          <Link href={`/communities/${community?.id}/invite`}>Invite others to community</Link>
        </Button>)}
      </div>

      <div className="px-4 pb-2 pt-1">
        {members.length > 0 ? (
          <ul className="space-y-3 pl-4">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <Link href={`/users/${member.id}`} className={'flex items-center gap-3'}>
                {member.avatar && (
                  <img
                  src={member.avatar}
                  alt={`${member.firstName} ${member.lastName}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                )}
                <span className=" text-gray-700">
                    {member.firstName} {member.lastName}
                </span>
                  </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-medium text-gray-500">No members found.</p>
        )}
      </div>
    </div>
  );
}