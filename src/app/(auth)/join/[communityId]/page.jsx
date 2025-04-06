'use client'

import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {useRouter} from 'next/navigation';
import {useSearchParams} from "next/navigation";
import { checkPhoneExists } from '@/lib/actions/clerk';

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberChecked, setPhoneNumberChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // First effect: Extract phone number from query parameters
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      const cleanPhone = phoneParam.replace(/\D/g, "");
      if (cleanPhone.length === 10) {
        setPhoneNumber(cleanPhone);
      }
    }
    setPhoneNumberChecked(true);
  }, [searchParams]);

  // Second effect: Check if phone is registered in Clerk and redirect accordingly
  useEffect(() => {
    async function checkPhoneNumberAndRedirect() {
      // Only proceed if we've checked for phone number
      if (phoneNumberChecked && params?.communityId) {
        localStorage.setItem('pendingCommunityJoin', params.communityId);

        // If no phone number available, just go to sign-up
        if (!phoneNumber) {
          router.push('/sign-up');
          return;
        }

        try {
          setIsLoading(true);

          // Call server action to check if user exists
          const result = await checkPhoneExists(phoneNumber);

          if (result.success) {
            // Redirect based on whether the user exists
            if (result.exists) {
              // User exists, send to sign-in
              router.push(`/sign-in`);
            } else {
              // New user, send to sign-up
              router.push(`/sign-up?phone=${phoneNumber}`);
            }
          } else {
            // If there's an error, default to sign-up
            console.error('Error from server action:', result.error);
            router.push(`/sign-up?phone=${phoneNumber}`);
          }
        } catch (error) {
          console.error('Error checking mobile phone number:', error);
          // If there's an error, default to sign-up
          router.push(`/sign-up?phone=${phoneNumber}`);
        } finally {
          setIsLoading(false);
        }
      }
    }

    checkPhoneNumberAndRedirect();
  }, [params, phoneNumberChecked, phoneNumber, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your information...</p>
        </div>
      )}
    </div>
  );
}