"use server"

import twilioService from '@/lib/services/twilioService';
import { getPrivateUserById } from '@/lib/actions/user';
import {normalizePhoneNumber} from "@/lib/utils.js";
import {PUBLIC_APP_URL} from "@/lib/constants.js";

// Send SMS invitation
export async function sendCommunityInvitation(phoneNumber, community, appUser) {
  const communityLink = `${PUBLIC_APP_URL}/join/${community.id}?phone=${phoneNumber}`;
  const messageBody = `${appUser.firstName} ${appUser.lastName} invited to join the ${community.name} in ${community.organization.name} at 12More! Click here to join: ${communityLink}`;

  const smsResult = await twilioService.sendSMS(normalizePhoneNumber(phoneNumber), messageBody);
  if (!smsResult.success) {
    console.error('SMS failed:', smsResult.message);
  } else {
    console.log('SMS result:', smsResult.message);
  }
  return smsResult;
};

export async function inviteCurrentUserToCommunity(userId, community, appUser){

  const userData = await getPrivateUserById(userId);

  if(!userData.success) return {success: false, message: "Problem gathering userData"};
  const user = userData.user;

  if(!user){
    return {success: false, message: "Problem finding user"};
  }

  const smsResult = await sendCommunityInvitation(user.phoneNumber, community, appUser);

  if (!smsResult.success){
    return {success: false, message: "Problem sending the SMS"};
  }

  return {success: true, message: "User invited successfully."};
}
