"use server";

import { auth } from "@clerk/nextjs/server";

export async function requireUser() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return { userId };

  //How to use:
  //const { userId } = await requireUser();
}