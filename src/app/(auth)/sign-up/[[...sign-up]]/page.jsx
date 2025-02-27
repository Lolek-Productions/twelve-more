'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'
import Image from "next/image";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import * as React from "react";

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submissionState, setSubmissionState] = useState("idle"); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  return (
    <div className="min-h-screen grid w-full flex-grow items-center bg-zinc-100 px-4 sm:justify-center">
      <SignUp.Root>
        <SignUp.Step
          name="start"
          className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
        >
          <header className="text-center">
            <Image
              src="/logo.png"
              alt="TwelveMore"
              className="mx-auto"
              width={45}
              height={45}
              priority
            />
            <h1 className="mt-4 text-xl font-medium tracking-tight text-zinc-950">
              Create an account
            </h1>
          </header>
          <Clerk.GlobalError className="block text-sm text-red-400" />
          {errorMessage && (
            <div className="block text-sm text-red-400">{errorMessage}</div>
          )}

          <div className="space-y-4">
            {/* First Name Field */}
            <Clerk.Field name="firstName" className="space-y-2">
              <Clerk.Label className="text-sm font-medium text-zinc-950">
                First Name
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g., John"
                className={`w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 ${
                  submissionState === "error" ? "ring-red-400" : ""
                } ${submissionState === "submitting" ? "opacity-50" : ""}`}
                disabled={submissionState === "submitting"}
              />
              <Clerk.FieldError className="block text-sm text-red-400"/>
            </Clerk.Field>

            {/* Last Name Field */}
            <Clerk.Field name="lastName" className="space-y-2">
              <Clerk.Label className="text-sm font-medium text-zinc-950">
                Last Name
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g., Smith"
                className={`w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 ${
                  submissionState === "error" ? "ring-red-400" : ""
                } ${submissionState === "submitting" ? "opacity-50" : ""}`}
                disabled={submissionState === "submitting"}
              />
              <Clerk.FieldError className="block text-sm text-red-400"/>
            </Clerk.Field>

            {/* Existing Phone Number Field */}
            <Clerk.Field name="phoneNumber" className="space-y-2">
              <Clerk.Label className="text-sm font-medium text-zinc-950">
                Mobile Phone Number
              </Clerk.Label>
              <Clerk.Input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g., 2025550123"
                maxLength={10}
                className={`w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 ${
                  submissionState === "error" ? "ring-red-400" : ""
                } ${submissionState === "submitting" ? "opacity-50" : ""}`}
                disabled={submissionState === "submitting"}
              />
              <p className="text-xs text-zinc-500">
                Enter your 10-digit US phone number (no +1 needed).
              </p>
              <Clerk.FieldError className="block text-sm text-red-400"/>
            </Clerk.Field>

            <div className="flex items-center space-x-4">
              <Checkbox
                id="smsOptIn"
                checked={smsOptIn}
                onCheckedChange={(checked) => setSmsOptIn(checked)}
              />
              <Label htmlFor="smsOptIn" className="text-sm">
                I agree to receive SMS notifications from TwelveMore. Message & data rates may apply.
                Reply <strong>STOP</strong> to unsubscribe.
                See our <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
              </Label>
            </div>

            <div id="clerk-captcha" className="mt-4"></div>

            <button
              disabled={
                phoneNumber.length !== 10 ||
                !firstName ||
                !lastName ||
                !smsOptIn ||
                submissionState === "submitting"
              }
              className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70 disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              {submissionState === "submitting" ? "Submitting..." : "Sign Up"}
            </button>
          </div>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Clerk.Link
              navigate="sign-in"
              className="font-medium text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline"
            >
              Sign in
            </Clerk.Link>
          </p>
        </SignUp.Step>

        {/* Verification step remains unchanged */}
        <SignUp.Step
          name="verifications"
          className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
        >
          <header className="text-center">
            <Image
              src="/logo.png"
              alt="TwelveMore"
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

          <SignUp.Strategy name="phone_code">
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
            <SignUp.Action
              submit
              className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
            >
              Verify
            </SignUp.Action>
          </SignUp.Strategy>
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Clerk.Link
              navigate="sign-in"
              className="font-medium text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline"
            >
              Sign in
            </Clerk.Link>
          </p>
        </SignUp.Step>
      </SignUp.Root>
    </div>
  );
}