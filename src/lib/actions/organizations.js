"use server";

import Organization from "@/lib/models/organization.model"; // Define this model
import { connect } from "@/lib/mongodb/mongoose";

export async function createOrganization({ name }) {
  try {
    await connect(); // Ensure this is idempotent or guarded
    const data = await Organization.create({ name }); // Creates a new document

    const organization = {
      id: data._id?.toString() || "",
      name: data.name,
    }

    return { success: true, message: "Organization created", data: organization };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteOrganization(id) {
  try {
    await connect();
    await Organization.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
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

export async function addUserToOrganization(organizationId, userId) {
  try {
    await connect();
    const org = await Organization.findByIdAndUpdate(
      organizationId,
      { $addToSet: { members: userId } }, // Assuming members is an array of user IDs
      { new: true }
    );
    return { success: true, message: "User added to organization" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}