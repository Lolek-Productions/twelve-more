"use server"

import twilioService from '@/lib/services/twilioService';
import {
  addCommunityToUser,
  addOrganizationToUser, getPrivateUserById,
  getUserByClerkId, getUserById,
  setSelectedOrganizationOnUser
} from '@/lib/actions/user';
import {normalizePhoneNumber} from "@/lib/utils.js";


// Send SMS invitation
const sendCommunityInvitation = async (firstName, phoneNumber, communityId, appUser) => {
  const communityLink = `https://twelvemore.social/communities/${communityId}`;

  const messageBody = `${appUser.firstName} ${appUser.lastName} invited to join a community at TwelveMore! Click here to check it out: ${communityLink}`;

  const smsResult = await twilioService.sendSMS(normalizePhoneNumber(phoneNumber), messageBody);
  if (!smsResult.success) {
    console.error('SMS failed:', smsResult.message);
  } else {
    console.log('SMS result:', smsResult.message);
  }
  return smsResult;
};

export async function inviteCurrentUserToCommunity(userId, communityId, appUser){

  const user = await getPrivateUserById(userId);
  if(!user.id){
    return {success: false, message: "Problem finding user"};
  }

  const response = await addCommunityToUser(communityId, userId);
  if(!response.success){
    return {success: false, message: "Problem adding user to community"};
  }

  const smsResult = await sendCommunityInvitation(user.firstName, user.phoneNumber, communityId, appUser)
  if (!smsResult.success){
    return {success: false, message: "Problem sending the SMS"};
  }

  return {success: true, message: "User invited successfully."};
}




export async function inviteNewUserToCommunity(phoneNumber, community, appUser) {
  try {
    const communityLink = `https://twelvemore.social/join/${community.id}`;
    const messageBody = `${appUser.firstName} ${appUser.lastName} invited to join the ${community.name} community at TwelveMore! Click here to join: ${communityLink}`;
    const smsResult = await twilioService.sendSMS(normalizePhoneNumber(phoneNumber), messageBody);

    if (!smsResult.success) {
      console.error('SMS failed:', smsResult.message);
      return { success: false, message: `Problem sending text message to ${phoneNumber}`};
    }

    return { success: true, message: `Successfully invited ${phoneNumber}`};
  } catch (error) {
    console.error(error);
    return { success: false, message: `Problem inviting ${phoneNumber}`};
  }
}