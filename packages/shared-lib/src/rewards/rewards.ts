import firebase from "firebase/compat/app"
import { Identifiable } from "../commonTypes"

/**
 * When changing shared files, be sure to deploy both the webapp and the functions using this code
 */

/**
 * All Reward Actions
 * Key Value instead of an Enum to be able to be used from js code
 */
export const RewardActions = {
   REFERRAL_SIGNUP_LEADER: "REFERRAL_SIGNUP_LEADER",
   REFERRAL_SIGNUP_FOLLOWER: "REFERRAL_SIGNUP_FOLLOWER",
   LIVESTREAM_REGISTER_COMPLETE_LEADER: "LIVESTREAM_REGISTER_COMPLETE_LEADER",
   LIVESTREAM_REGISTER_COMPLETE_FOLLOWER:
      "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER",
   LIVESTREAM_INVITE_COMPLETE_LEADER: "LIVESTREAM_INVITE_COMPLETE_LEADER", // event attendance complete
   LIVESTREAM_INVITE_COMPLETE_FOLLOWER: "LIVESTREAM_INVITE_COMPLETE_FOLLOWER",

   // User progression badges
   LIVESTREAM_USER_ATTENDED: "LIVESTREAM_USER_ATTENDED",
   LIVESTREAM_USER_ASKED_QUESTION: "LIVESTREAM_USER_ASKED_QUESTION",
   LIVESTREAM_USER_HAND_RAISED: "LIVESTREAM_USER_HAND_RAISED",
}

export const REWARD_LIVESTREAM_ATTENDANCE_SECONDS = 5 * 60 // 5 minutes

/**
 * Every new user should get 3 credits when creating an account
 */
export const INITIAL_CREDITS = 3

export const getHumanStringDescriptionForAction = (action) => {
   switch (action) {
      case RewardActions.REFERRAL_SIGNUP_FOLLOWER:
         return "SignUp through a referral"
      case RewardActions.REFERRAL_SIGNUP_LEADER:
         return "Referral SignUp Successful"
      case RewardActions.LIVESTREAM_REGISTER_COMPLETE_LEADER:
         return "Registered an invited event"
      case RewardActions.LIVESTREAM_REGISTER_COMPLETE_FOLLOWER:
         return "Event Registration Successful"
      case RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER:
         return "Attended an invited event"
      case RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER:
         return "Event Invitation Successful"
      case RewardActions.LIVESTREAM_USER_ATTENDED:
         return "You attended a livestream event"
      case RewardActions.LIVESTREAM_USER_ASKED_QUESTION:
         return "You asked a question during a livestream event"
      case RewardActions.LIVESTREAM_USER_HAND_RAISED:
         return "You have raised your hand during a livestream event"
      default:
         return action
   }
}

export interface RewardDoc extends Identifiable {
   action: string
   createdAt: firebase.firestore.Timestamp
   seenByUser: boolean

   // if the reward is related to a different user than the user owning the
   // these fields will be populated
   userId?: string
   userData?: {
      firstName: string
      lastName: string
   }

   // credits to award the user
   // positive or negative
   credits?: number

   // if the reward is related to a livestream, will contain some details about the livestream
   livestreamId?: string
   livestreamData?: {
      title: string
      summary: string
      company?: string
      companyLogoUrl?: string
      start: firebase.firestore.Timestamp
   }
}
