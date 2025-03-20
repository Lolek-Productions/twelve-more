'use client';

import Link from "next/link"
import {Button} from "@/components/ui/button.jsx";
import {useClipboard} from "@/hooks/useClipboard.js";


export default function MemberList({ community, members, hideInvite = false }) {
  const [isCopied, copyToClipboard] = useClipboard();

  return (
    <div className="mt-3 text-gray-700 space-y-3 bg-gray-100 rounded-xl py-2">
      <div className={'items-center flex flex-col px-4'}>

        <h4 className="font-bold text-xl text-center">
          Community Members: {community?.name}{" "}
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full align-middle">
            {community?.visibility
              ? community.visibility.charAt(0).toUpperCase() + community.visibility.slice(1)
              : ""}
          </span>
        </h4>

        {!hideInvite && (<Button asChild className="mt-3">
          <Link href={`/communities/${community?.id}/invite`}>Invite others to community</Link>
        </Button>)}

        <div className='mt-2'>
          <button
            onClick={() => copyToClipboard(`https://twelvemore.social/join/${community?.id}/`)}
            title={`https://twelvemore.social/join/${community?.id}/`}
            className="px-2 py-1 text-sm text-blue-600 hover:text-gray-600
               bg-gray-100 hover:bg-gray-200 rounded
               flex items-center gap-1 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {isCopied ? 'Copied!' : 'Copy invite url'}
          </button>
        </div>
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