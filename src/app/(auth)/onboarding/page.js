'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Image from "next/image";
import {Checkbox} from "@/components/ui/checkbox";
import Link from "next/link"

export default function OnboardingComponent() {
  const [error, setError] = React.useState('');
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData) => {
    const res = await completeOnboarding(formData)
    if (res?.message) {
      await user?.reload() // Reload Clerk user data
      router.push('/home')
    }
    if (res?.error) {
      setError(res?.error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <Image
            src="/logo.png" // Use the path from the public folder
            alt="TwelveMore"
            className={'mx-auto'}
            width={45}
            height={45}
            priority
          />
          <CardTitle className="text-center text-2xl">Welcome to TwelveMore!</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-4">
            We have a great purpose at TwelveMore.  We are going to explain it here.
          </div>

          <Button asChild variant="default" className="mt-9 w-full" size="lg">
            <Link href="/home" className="block w-full text-center">
              Get Started
            </Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}