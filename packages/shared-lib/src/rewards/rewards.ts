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

/**
 * How many referrals required for giving the REFERRAL_FIRST_FRIENDS reward
 * exclusive
 */
export const REFERRAL_FIRST_FRIENDS_NUM = 3

/**
 * How many credits to reward a user after the first 3 referrals
 */
export const REFERRAL_AFTER_FIRST_FRIENDS_CREDITS = 1

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

   /**
    * Whether the user should be notified about this reward
    */
   shouldNotifyUser?: boolean
}

/**
 * All Rewards objects
 */
export const REWARDS: Record<string, Reward> = {
   /**
    * Rewards triggered by user actions
    * These, require a cloud function to be triggered
    */
   USER_CV_UPLOAD: {
      name: "USER_CV_UPLOAD",
      credits: 1,
      humanStringDescription: "You have uploaded your CV",
      shouldNotifyUser: true,
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
   LIVESTREAM_INVITE_COMPLETE_FOLLOWER: {
      name: "LIVESTREAM_INVITE_COMPLETE_FOLLOWER",
      credits: 0,
      humanStringDescription: "Attended an invited event",
   },
   // created when applying the referral code during signup
   REFERRAL_SIGNUP_FOLLOWER: {
      name: "REFERRAL_SIGNUP_FOLLOWER",
      credits: 0,
      humanStringDescription: "SignUp through a referral",
   },

   /**
    * Rewards given by side effects
    * We create these in the backend in reaction for some action
    */
   REFERRAL_SIGNUP_LEADER: {
      name: "REFERRAL_SIGNUP_LEADER",
      credits: 0,
      humanStringDescription: "Referral SignUp Successful",
   },
   // REFERRAL_FIRST_FRIENDS_NUM friends have signed up
   REFERRAL_FIRST_FRIENDS: {
      name: "REFERRAL_FIRST_FRIENDS",
      credits: 3,
      shouldNotifyUser: true,
      humanStringDescription: `You have referred your first ${REFERRAL_FIRST_FRIENDS_NUM} friends`,
   },
   LIVESTREAM_REGISTER_COMPLETE_LEADER: {
      name: "LIVESTREAM_REGISTER_COMPLETE_LEADER",
      credits: 0,
      humanStringDescription: "Registered an invited event",
   },
   // created when a userLivestreamData doc is created
   LIVESTREAM_REGISTER_COMPLETE_FOLLOWER: {
      name: "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER",
      credits: 0,
      humanStringDescription: "Event Registration Successful",
   },
   LIVESTREAM_INVITE_COMPLETE_LEADER: {
      // event attendance complete
      name: "LIVESTREAM_INVITE_COMPLETE_LEADER",
      credits: 0,
      humanStringDescription: "Event Invitation Successful",
   },
   LIVESTREAM_USER_FIRST_ATTENDED: {
      name: "LIVESTREAM_USER_FIRST_ATTENDED",
      credits: 1,
      humanStringDescription: "You have attended your first live stream event",
      shouldNotifyUser: true,
   },

   /**
    * Rewards triggered by spending credits
    */
   LIVESTREAM_RECORDING_BOUGHT: {
      name: "LIVESTREAM_RECORDING_BOUGHT",
      credits: -1,
      humanStringDescription: "You have bought access to the recording",
   },
} as const

export type RewardAction = keyof typeof REWARDS

export const getHumanStringDescriptionForAction = (action: RewardAction) => {
   if (REWARDS[action]) {
      return REWARDS[action].humanStringDescription
   }

   return action
}

export const getCustomRewardMessageForAction = (
   action: RewardAction
): string => {
   switch (action) {
      case "USER_CV_UPLOAD":
         return `As a reward for uploading your CV you’ve received +${REWARDS[action].credits} CareerCoin to use inside our platform.`

      default:
         return ""
   }
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
