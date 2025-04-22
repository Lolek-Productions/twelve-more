"use server";

import { currentUser } from '@clerk/nextjs/server';

//How to use:
//await requireUser();

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}