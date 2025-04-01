'use client';

import Link from "next/link"
import {useEffect, useState} from "react";
import {getRecentOrganizationsMembers} from "@/lib/actions/user.js";
import moment from "moment/moment";

export default function RecentOrganizationMember({organization}) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(!organization) return;

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const data = await getRecentOrganizationsMembers(organization.id);
        // console.log(data.data)
        setMembers(data.data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [organization]);

  return (
    <div className="mt-3 text-gray-700 space-y-3 bg-gray-100 rounded-xl py-2">
      <h4 className="font-bold px-4">Recent Members to {organization?.name}</h4>
      <div className="px-4 pb-2">
        {members.length > 0 ? (
          <ul className="space-y-4 pl-4">
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
                  <div>
                    <span className=" text-gray-700">
                      {member.firstName} {member.lastName}
                    </span>
                    <p className={'text-xs text-gray-500'}>Signed up {moment(member.createdAt).fromNow()}</p>
                  </div>
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