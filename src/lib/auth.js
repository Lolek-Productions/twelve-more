"use server";

import { currentUser } from '@clerk/nextjs/server';

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { user };

  //How to use:
  //await requireUser();
}