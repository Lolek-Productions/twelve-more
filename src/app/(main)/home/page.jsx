"use client";

import HomeFeed from '@/components/HomeFeed';
import Input from '@/components/Input';
import { useEffect, useCallback } from "react";
import { useContextContent } from "@/components/ContextProvider";
import HomeContextSidebar from "@/components/HomeContextSidebar";
import {useAppUser} from "@/hooks/useAppUser.js";

export default function HomePage() {
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
            <>Home: {appUser?.selectedOrganization?.name}</> :
            'Select An Organization'
          }
        </h2>
      </div>
      {appUser?.selectedOrganization?.id &&
        <>
          <Input/>
          <HomeFeed/>
        </>
      }
    </>
  );
}