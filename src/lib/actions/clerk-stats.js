'use server'

import {requireUser} from "@/lib/auth.js";
import {clerkClient} from "@clerk/nextjs/server";


export async function getActiveUsers(startDate, endDate) {
  try {
    await requireUser();

    // Process input dates
    const start = startDate
      ? new Date(startDate)
      : new Date() // Default to today if no start date provided

    const end = endDate
      ? new Date(endDate)
      : new Date(start) // Default to start date if no end date provided

    // Ensure we're using the start of the start date and end of the end date
    const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString()
    const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1).toISOString()


    // Query Clerk API for users active within the date range
    const client = await clerkClient();

    const activeUsers = await client.users.getUserList({
      last_active_at: {
        gte: startISO,
        lte: endISO
      },
      limit: 500  // Adjust based on your needs
    })

    return {
      success: true,
      count: activeUsers.data.length,
    }
  } catch (error) {
    console.error("Error fetching active users:", error)
    throw new Error("Failed to fetch active users")
  }
}