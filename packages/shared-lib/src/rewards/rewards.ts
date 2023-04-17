import firebase from "firebase/compat/app"
import { Identifiable } from "../commonTypes"
import { LivestreamEventPublicData } from "../livestreams"
import { UserPublicData } from "../users"

/**
 * When changing shared files, be sure to deploy both the webapp and the functions using this code
 */

// Constants

/**
 * How many seconds a user should be attending a livestream to get a reward
 */
export const REWARD_LIVESTREAM_ATTENDANCE_SECONDS = 5 * 60 // 5 minutes

/**
 * Every new user should get 3 credits when creating an account
 */
export const INITIAL_CREDITS = 3

// Types

type Reward = {
   /**
    * Name of the reward
    */
   name: string

   /**
    * Credits to award the user
    */
   credits: number

   /**
    * Description that can be used in the UI
    */
   humanStringDescription: string
}

/**
 * All Rewards objects
 */
export const REWARDS = {
   REFERRAL_SIGNUP_LEADER: {
      name: "REFERRAL_SIGNUP_LEADER",
      credits: 0,
      humanStringDescription: "Referral SignUp Successful",
   },
   REFERRAL_SIGNUP_FOLLOWER: {
      name: "REFERRAL_SIGNUP_FOLLOWER",
      credits: 0,
      humanStringDescription: "SignUp through a referral",
   },
   LIVESTREAM_REGISTER_COMPLETE_LEADER: {
      name: "LIVESTREAM_REGISTER_COMPLETE_LEADER",
      credits: 0,
      humanStringDescription: "Registered an invited event",
   },
   LIVESTREAM_REGISTER_COMPLETE_FOLLOWER: {
      name: "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER",
      credits: 0,
      humanStringDescription: "Event Registration Successful",
   },
   LIVESTREAM_INVITE_COMPLETE_FOLLOWER: {
      name: "LIVESTREAM_INVITE_COMPLETE_FOLLOWER",
      credits: 0,
      humanStringDescription: "Attended an invited event",
   },
   LIVESTREAM_INVITE_COMPLETE_LEADER: {
      // event attendance complete
      name: "LIVESTREAM_INVITE_COMPLETE_LEADER",
      credits: 0,
      humanStringDescription: "Event Invitation Successful",
   },
   // User progression badges
   LIVESTREAM_USER_ATTENDED: {
      name: "LIVESTREAM_USER_ATTENDED",
      credits: 0,
      humanStringDescription: "You attended a livestream event",
   },
   LIVESTREAM_USER_ASKED_QUESTION: {
      name: "LIVESTREAM_USER_ASKED_QUESTION",
      credits: 0,
      humanStringDescription: "You asked a question during a livestream event",
   },
   LIVESTREAM_USER_HAND_RAISED: {
      name: "LIVESTREAM_USER_HAND_RAISED",
      credits: 0,
      humanStringDescription:
         "You have raised your hand during a livestream event",
   },
} satisfies Record<string, Reward>

export type RewardAction = keyof typeof REWARDS

export const getHumanStringDescriptionForAction = (action: RewardAction) => {
   if (REWARDS[action]) {
      return REWARDS[action].humanStringDescription
   }

   return action
}

/**
 * Firestore Document
 *
 * /userData/{userId}/rewards/{rewardId}
 */
export interface RewardDoc extends Identifiable {
   action: RewardAction
   createdAt: firebase.firestore.Timestamp
   seenByUser: boolean

   // if the reward is related to a different user than the user owning the
   // these fields will be populated
   userId?: string
   userData?: UserPublicData

   // credits to award the user
   // positive or negative
   credits?: number

   // if the reward is related to a livestream, will contain some details about the livestream
   livestreamId?: string
   livestreamData?: LivestreamEventPublicData
}
