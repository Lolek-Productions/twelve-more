"use server";

import Organization from "@/lib/models/organization.model"; // Define this model
import { connect } from "@/lib/mongodb/mongoose";
import Community from "@/lib/models/community.model";
import User from '../models/user.model';
import {addCommunityToUser, addOrganizationToUser} from "@/lib/actions/user.js";

export async function createOrganization(formData, appUser) {
  try {
    await connect();

    const data = await Organization.create({
      name: formData.name,
      description: formData.description,
      createdBy: appUser.id,
    });

    const organization = {
      id: data._id?.toString() || "",
      name: data.name,
      description: data.description,
    }

    const orgAddResult = await addOrganizationToUser(organization.id, appUser.id);
    if (!orgAddResult.success) {
      throw new Error(`Failed to associate organization with user: ${orgAddResult.error}`);
    }

    const community = await Community.create({
      name: `Welcome to ${data.name}!`,
      purpose: `To warmly invite new members to feel a greater sense of belonging at ${data.name}`,
      visibility: "public",
      createdBy: appUser.id,
      organization: organization.id,
    });

    // Add the community to the organization as the welcomingCommunity
    await Organization.findByIdAndUpdate(
      organization.id,
      { welcomingCommunity: community._id }
    );

    //TODO need to see about adding the organization as selectedOrganization

    // Add community to User (consider a specific function to add as admin)
    const comAddResult = await addCommunityToUser(community._id.toString(), appUser.id);
    if (!comAddResult.success) {
      console.warn(`Failed to associate community with user: ${comAddResult.error}`);
      // We don't throw here since the organization was already created
    }

    return { success: true, message: "Organization created", data: organization };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteOrganization(id) {
  console.log('organization Id:', id)

  //TODO: Lots of things to do here.  See the above: CreateOrganization and undo all of that.

  try {
    await connect();
    await Organization.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }


}

export async function getOrganizations() {
  try {
    await connect();
    const orgs = await Organization.find().lean();
    return orgs.map(org => ({
      id: org._id.toString(),
      name: org.name,
      ownerPhoneNumber: org.ownerPhoneNumber,
      members: org.members || [],
    }));
  } catch (error) {
    throw error;
  }
}

export const getOrganizationById = async function (organizationId) {
  try {
    await connect(); // Ensure database connection

    const organization = await Organization.findById(organizationId)
      .lean();

    if (!organization) {
      console.error("No organization found for ID:", organizationId);
      return null;
    }

    return {
      id: organization._id?.toString() || "",
      name: organization.name,
      description: organization.description,
    };
  } catch (error) {
    console.error("Error fetching organization by ID:", error);
    return null;
  }
};

export async function searchOrganizations(query) {
  try {
    // Input validation
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return {
        success: false,
        error: "Query must be a string with at least 2 characters",
      };
    }

    await connect(); // Ensure database connection

    // Create a case-insensitive regex for the query
    const regex = new RegExp(query.trim(), "i");

    // Search users by firstName or lastName
    const organizations = await Organization.find({
        $or: [
          { name: { $regex: regex } },
        ],
      })
      .select("name") // Fetch only needed fields
      .limit(10) // Limit results for performance
      .lean(); // Return plain JS objects

    // Map results to the expected format
    const formattedOrganizations = organizations.map((organization) => ({
      id: organization._id.toString(),
      name: `${organization.name}`.trim(),
    }));

    console.log(formattedOrganizations);

    return {
      success: true,
      data: formattedOrganizations,
    };
  } catch (error) {
    console.error("Error searching organizations:", error);
    return {
      success: false,
      error: "Failed to search organizations",
    };
  }
}