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

    // Convert to Unix timestamps in milliseconds
    // Set start to beginning of day (00:00:00)
    const startTimestamp = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0, 0, 0, 0
    ).getTime();

    // Set end to end of day (23:59:59.999)
    const endTimestamp = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23, 59, 59, 999
    ).getTime();

    // Query Clerk API for users active within the date range
    const client = await clerkClient();

    const activeUsers = await client.users.getUserList({
      last_active_at_before: endTimestamp,
      last_active_at_after: startTimestamp,
      limit: 500  // Adjust based on your needs
    })

    console.log('Active users:', activeUsers.data.length);

    return {
      success: true,
      count: activeUsers.data.length,
    }
  } catch (error) {
    console.error("Error fetching active users:", error)
    throw new Error("Failed to fetch active users")
  }
}