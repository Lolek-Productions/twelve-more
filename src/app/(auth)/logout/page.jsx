"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    signOut(() => {
      router.replace("/sign-in");
    });
  }, [signOut, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg">
      Signing out...
    </div>
  );
}