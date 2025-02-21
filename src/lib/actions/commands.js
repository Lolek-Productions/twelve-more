"use server";

import {clerkClient} from "@clerk/nextjs/server";

export async function runCommand(commandName) {
  try {
    const client = await clerkClient();

    switch (commandName) {
      case "Log Hello":
        console.log("Hello from the server!");
        return { success: true, message: "Logged 'Hello' to server console" };

      case "Create Josh in Clerk": {
        // Create a user named "Josh" with minimal required fields
        const user = await client.users.createUser({
          phoneNumber: ['+12708831110'], // Use dynamic phoneNumber
          publicMetadata: { invitationOrganizationId: 'sup9er coool organization ID'},
          skipLegalChecks: true,
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
          return { success: false, error: `No user found with phone number ${phoneNumber}` };
        }
        const userId = users.data[0].id;
        await client.users.deleteUser(userId);
        return {
          success: true,
          message: `Deleted Josh in Clerk (ID: ${userId}, Phone: ${phoneNumber})`,
        };
      }

      default:
        return { success: false, error: "Unknown command" };
    }
  } catch (error) {
    console.error(`Error running command ${commandName}:`, error.message);
    return { success: false, error: `Failed to execute command: ${error.message}` };
  }
}