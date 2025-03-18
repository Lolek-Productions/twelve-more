'use client'

import React, {useEffect} from 'react';
import {useParams} from "next/navigation";
import {useRouter} from 'next/navigation';

export default function Page() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.communityId) {
      localStorage.setItem('pendingCommunityJoin', params.communityId);

      router.push('/sign-up');
    }
  }, [params]);

  return (
    <div></div>
  );
}