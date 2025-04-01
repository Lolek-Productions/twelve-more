'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RecentOrganizationMembers from "@/components/RecentOrganizationMembers.jsx";
import {useApiToast} from "@/lib/utils.js";
import {deleteOrganization} from "@/lib/actions/organization.js";
import {useAppUser} from "@/hooks/useAppUser.js";

export default function OrganizationContextSidebar({organization}) {
  const [input, setInput] = useState('');
  const router = useRouter();
  const { showResponseToast, showErrorToast } = useApiToast();
  const {appUser} = useAppUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search/${input}`);
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  const onDeleteOrganization = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this organization?");

    if (isConfirmed) {
      const removalResponse = await deleteOrganization(organization.id);

      if(removalResponse.success) {
        window.location.href = "/home";
        showResponseToast(removalResponse);
      } else {
        showErrorToast(removalResponse.message);
      }
    }
  };

  return (
    <div  className={'p-3'}>
      <div className='sticky top-0 bg-white py-2'>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='Search Posts'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='bg-gray-100 border border-gray-200 rounded-3xl text-sm w-full px-4 py-2'
          />
        </form>
      </div>
      <RecentOrganizationMembers organization={organization} />

      {/*Only show this if the appUser is a leader in the organization*/}
      {appUser?.organizations?.some(org => {
          // console.log(org.role)
          return org.role === 'leader';
        }
      ) && (
        <div className="flex justify-center w-full pt-2">
          <button onClick={() => onDeleteOrganization()} className="text-red-500 hover:text-red-700 font-medium transition-colors duration-200">
            Delete Organization
          </button>
        </div>
      )}

    </div>
  );
}
