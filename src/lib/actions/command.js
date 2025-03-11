"use server";

import {clerkClient} from "@clerk/nextjs/server";
import twilioService from "@/lib/services/twilioService";
import {getPrivateUserById} from "@/lib/actions/user.js";

export async function runCommand(commandName) {
  try {
    const client = await clerkClient();

    switch (commandName) {
      case "Log Hello":
        console.log("Hello from the server!");
        return { success: true, message: "Logged 'Hello' to server console" };

      case "Create Josh in Clerk": {
        const user = await client.users.createUser({
          phoneNumber: ['+12708831110'],
          firstName: "TESTJOSH",
          lastName: "TESTMCCARTY",
          publicMetadata: { smsOptIn:true },
        });

        return {
          success: true,
          message: `Created Josh in Clerk with ID: ${user.id}`,
        };
      }

      case "Delete Josh in Clerk": {
        // Search for user by phone number
        const phoneNumber = "+12708831110";
        const users = await client.users.getUserList({
          phoneNumber: [phoneNumber], // Match the phone number used in creation
          limit: 1,
        });
        if (!users.data.length) {
          return { success: false, message: `No user found with phone number ${phoneNumber}` };
        }
        const userId = users.data[0].id;
        await client.users.deleteUser(userId);
        return {
          success: true,
          message: `Deleted Josh in Clerk (ID: ${userId}, Phone: ${phoneNumber})`,
        };
      }

      case "Send Test SMS": {
        const result = await twilioService.sendSMS(
          '+12708831110',
          'This is a test SMS from TwelveMore! Enjoy your day!'
        );

        return {
          success: result.success,
          message: result.message,
        };
      }

      case "Send Test Batch SMS": {
        const result = await twilioService.sendBatchSMS(
          ['+12708831110'],
          'This is a test BATCH SMS from TwelveMore! Enjoy your day!'
        );

        return {
          success: result.success,
          message: result.message,
        };
      }

      case "TEST": {
        try {
          const userId = "67b63722b63603a6b567eb31"; // Replace with a real user ID from your database

          const user = await getPrivateUserById(userId);

          if (!user) {
            return { success: false, message: `No user found with ID: ${userId}` };
          }

          console.log("TEST TEST TEST", user);

          return { success: true, message: `Found user: ${user.firstName} ${user.lastName}` };
        } catch (dbError) {
          console.error("Database error:", dbError);
          return { success: false, message: `Database error: ${dbError.message}` };
        }

      }

      default:
        return { success: false, message: "Unknown command" };
    }
  } catch (error) {
    console.error(`Error running command ${commandName}:`, error.message);
    return { success: false, message: `Failed to execute command: ${error.message}` };
  }
}