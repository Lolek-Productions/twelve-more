"use server";

import {clerkClient} from "@clerk/nextjs/server";
import twilioService from "@/lib/services/twilioService";
import {getPrivateUserById} from "@/lib/actions/user.js";
import Course from "@/lib/models/course.model";
import { connect } from '../mongodb/mongoose.js';
import {postSystemStatsToDevelopersCommunity} from "./system-post.js";

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
          'This is a test SMS from 12More! Enjoy your day!'
        );

        return {
          success: result.success,
          message: result.message,
        };
      }

      case "Send Test Batch SMS": {
        const result = await twilioService.sendBatchSMS(
          ['+12708831110'],
          'This is a test BATCH SMS from 12More! Enjoy your day!'
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

      case "Create System Post in Test Organization": {
        const result = await postSystemStatsToDevelopersCommunity();

        return {
          success: true,
          message: result.message,
        };
      }

      case "Seed Example Course": {
        await connect();
        const exampleCourse = {
          name: "Example Course",
          description: "A sample course with all module types.",
          createdBy: "67b63722b63603a6b567eb31",
          modules: [
            {
              title: "Welcome Video",
              type: "video",
              content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              order: 1,
            },
            {
              title: "Intro Quiz",
              type: "quiz",
              content: [
                {
                  question: "What is 2 + 2?",
                  options: ["3", "4", "5"],
                  answer: "4",
                  explanation: "2 plus 2 equals 4.",
                },
                {
                  question: "What color is the sky?",
                  options: ["Blue", "Green", "Red"],
                  answer: "Blue",
                  explanation: "The sky appears blue due to Rayleigh scattering.",
                },
              ],
              order: 2,
            },
            {
              title: "Course Overview",
              type: "text",
              content: "This is the overview of the course. Welcome!",
              order: 3,
            },
          ],
        };
        const course = await Course.create(exampleCourse);
        return {
          success: true,
          message: `Seeded example course with ID: ${course._id}`,
        };
      }

      default:
        return { success: false, message: "Unknown command" };
    }
  } catch (error) {
    console.error(`Error running command ${commandName}:`, error.message);
    return { success: false, message: `Failed to execute command: ${error.message}` };
  }
}