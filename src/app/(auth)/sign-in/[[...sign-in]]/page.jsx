'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import Image from "next/image";
import * as React from "react";
import {useState} from "react";
import {TAG_LINE} from "@/lib/constants.js";

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");

  return (
    <div className="min-h-screen grid w-full flex-grow items-center bg-zinc-100 px-4 sm:justify-center">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
        >
          <header className="text-center">
            <Image
              src="/logo.png" // Use the path from the public folder
              alt="12More"
              className={'mx-auto'}
              width={45}
              height={45}
              priority
            />
            <div className="text-gray-600 pt-2">
              {TAG_LINE}
            </div>
            <div className="pt-3 text-xl font-medium tracking-tight text-zinc-950">
              Sign In to 12More
            </div>
          </header>

          <Clerk.GlobalError className="block text-sm text-red-400"/>

          <div className="space-y-4">
            <Clerk.Field name="identifier" className="space-y-2">
              <Clerk.Label className="text-sm font-medium text-zinc-950">Mobile Phone Number</Clerk.Label>
              <Clerk.Input
                type="tel"
                required
                value={formattedPhoneNumber}
                placeholder="e.g., 2025550123" // Suggest the format
                className="hidden w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
              />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => {
                    setFormattedPhoneNumber("+1" + e.target.value.replace(/\D/g, ""));
                    setPhoneNumber(e.target.value.replace(/\D/g, ""));
                  }
                }
                placeholder="e.g., 2025550123"
                maxLength={10}
                className={`w-full rounded-md drop-shadow-none shadow-none bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950`}
              />
              <p className="text-xs text-zinc-500">
                Enter your 10-digit US mobile phone number (no +1 needed).
              </p>
              <Clerk.FieldError className="block text-sm text-red-400"/>
            </Clerk.Field>
          </div>

          <SignIn.Action
            submit
            className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
          >
            Sign in
          </SignIn.Action>

          <p className="text-center text-sm text-zinc-500">
            Need to create an account?{' '}
            <Clerk.Link
              navigate="sign-up"
              className="font-medium text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline"
            >
              Sign up
            </Clerk.Link>
          </p>
        </SignIn.Step>

        <SignIn.Step
          name="verifications"
          className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
        >
          <header className="text-center">
            <Image
              src="/logo.png" // Use the path from the public folder
              alt="12More"
              className={'mx-auto'}
              width={45}
              height={45}
              priority
            />
            <h1 className="mt-4 text-xl font-medium tracking-tight text-zinc-950">
              Verification code sent to your phone
            </h1>
          </header>
          <Clerk.GlobalError className="block text-sm text-red-400" />

          <SignIn.Strategy name="phone_code">

            <Clerk.Field name="code" className="space-y-2">
              <Clerk.Input
                type="otp"
                required
                className="flex justify-center gap-1"
                render={({ value, status }) => (
                  <div
                    data-status={status}
                    className="relative h-9 w-8 rounded-md bg-white ring-1 ring-inset ring-zinc-300 data-[status=selected]:bg-sky-400/10 data-[status=selected]:shadow-[0_0_8px_2px_theme(colors.sky.400/30%)] data-[status=selected]:ring-sky-400"
                  >
                    {value && (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-950">
                        {value}
                      </div>
                    )}
                    {status === 'cursor' && (
                      <div
                        className="absolute inset-0 z-10 rounded-[inherit] border border-sky-400 bg-sky-400/10 shadow-[0_0_8px_2px_theme(colors.sky.400/30%)]"
                      />
                    )}
                  </div>
                )}
              />
              <Clerk.FieldError className="block text-sm text-red-400" />
            </Clerk.Field>
            <SignIn.Action
              submit
              className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
            >
              Verify
            </SignIn.Action>
          </SignIn.Strategy>
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Clerk.Link
              navigate="sign-in"
              className="font-medium text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline"
            >
              Sign in
            </Clerk.Link>
          </p>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  )
}