'use client';

import {useAppUser} from "@/hooks/useAppUser.js";
import HomeContextSidebar from "@/components/HomeContextSidebar.jsx";
import CommunitiesList from "@/components/CommunitiesList.jsx";
import {useEffect} from "react";
import {useContextContent} from "@/components/ContextProvider.jsx";


export default function CommunitiesPage() {
  const { appUser} = useAppUser();

  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<HomeContextSidebar />);
  }, [setContextContent]);

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>
          {appUser?.selectedOrganization?.id ?
            <>Communities: {appUser?.selectedOrganization?.name}</> :
            'Select An Organization'
          }
        </h2>
      </div>

      <CommunitiesList/>
    </>
  )
}