import {
   REFERRAL_AFTER_FIRST_FRIENDS_CREDITS,
   REFERRAL_FIRST_FRIENDS_NUM,
   RewardAction,
   RewardDoc,
   REWARDS,
} from "@careerfairy/shared-lib/rewards"
import functions = require("firebase-functions")
import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"
import { livestreamsRepo, rewardsRepo, userRepo } from "../api/repositories"
import type { Change } from "firebase-functions"
import { firestore } from "firebase-admin"
import DocumentSnapshot = firestore.DocumentSnapshot

export const rewardCreateReferralSignUpLeader = (
   leaderId: string,
   followerUserData: UserData
) => {
   return rewardsRepo.create(leaderId, "REFERRAL_SIGNUP_LEADER", {
      userId: followerUserData.id,
      userData: pickPublicDataFromUser(followerUserData),
   })
}

export const rewardCreateReferralSignUpFollower = (
   justRegisteredUserId: string,
   leaderUserData: UserData
) => {
   return rewardsRepo.create(justRegisteredUserId, "REFERRAL_SIGNUP_FOLLOWER", {
      userId: leaderUserData.id,
      userData: pickPublicDataFromUser(leaderUserData),
   })
}

export const rewardCreateLivestream = (
   userBeingRewardedId: string,
   action: RewardAction,
   relatedUserData: UserData,
   relatedLivestreamData: LivestreamEvent
) => {
   return rewardsRepo.create(userBeingRewardedId, action, {
      userId: relatedUserData.id,
      livestreamId: relatedLivestreamData.id,
      userData: pickPublicDataFromUser(relatedUserData),
      livestreamData: pickPublicDataFromLivestream(relatedLivestreamData),
   })
}

export const rewardCreateUserAction = (
   userBeingRewardedId: string,
   action: RewardAction,
   relatedLivestreamData?: LivestreamEvent
) => {
   const shouldNotifyUser = Boolean(REWARDS[action]?.shouldNotifyUser)

   // do not send reward notifications for user actions
   // by marking the reward as seen, the user doesn't receive a notification
   const otherData: Partial<RewardDoc> = {
      // Used ternary for readability
      seenByUser: shouldNotifyUser ? false : true,
   }

   if (relatedLivestreamData) {
      otherData.livestreamId = relatedLivestreamData.id
      otherData.livestreamData = pickPublicDataFromLivestream(
         relatedLivestreamData
      )
   }

   return rewardsRepo.create(userBeingRewardedId, action, otherData)
}

/**
 * Every time there is a new reward document, apply the reward depending on the action
 *
 * Watch-out when creating new rewards on this function, make sure it doesn't enter in infinite loop
 */

export const rewardApply = async (reward: RewardDoc, userEmail: string) => {
   // Apply credits to user
   if (reward.credits) {
      await rewardsRepo.applyCreditsToUser(userEmail, reward.credits)
   }

   // side effects depending on the reward action
   switch (reward.action) {
      /**
       * When a user (follower) signup using a referral code (leader)
       */
      case "REFERRAL_SIGNUP_FOLLOWER":
         // Also reward the user owner of the referral code (leader)
         await rewardCreateReferralSignUpLeader(
            reward.userId, // leader id
            await userRepo.getUserDataById(userEmail) // this follower data
         )

         break

      /**
       * When a user registers a livestream after being invited by someone (leader)
       */
      case "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER":
         // Also reward the user (leader) that created the invite
         await rewardCreateLivestream(
            reward.userId, // leader id
            "LIVESTREAM_REGISTER_COMPLETE_LEADER",
            await userRepo.getUserDataById(userEmail), // this follower data
            await livestreamsRepo.getById(reward.livestreamId)
         )

         break

      /**
       * When a user attends a livestream after being invited by someone (leader)
       */
      case "LIVESTREAM_INVITE_COMPLETE_FOLLOWER":
         // Also reward the user (leader) that created the invite
         await rewardCreateLivestream(
            reward.userId, // leader id
            "LIVESTREAM_INVITE_COMPLETE_LEADER",
            await userRepo.getUserDataById(userEmail), // this follower data
            await livestreamsRepo.getById(reward.livestreamId)
         )

         break

      /**
       * When a user (leader) referred someone with success (follower)
       * The follower sign up using the leader referral code
       */
      case "REFERRAL_SIGNUP_LEADER":
         // This user just won a new referral
         await userRepo.incrementStat(userEmail, "referralsCount", 1)

         // If the user has more than 3 referrals, give him a credit for each
         // extra referral
         await giveCreditsAfterFirstFriends(userEmail)
         break

      /**
       * When a user (leader) successfully invited another user (follower) to attend a livestream
       */
      case "LIVESTREAM_INVITE_COMPLETE_LEADER":
         await userRepo.incrementStat(userEmail, "totalLivestreamInvites", 1)
         break

      /**
       * User attended a livestream
       */
      case "LIVESTREAM_USER_ATTENDED":
         await userRepo.incrementStat(userEmail, "totalLivestreamAttendances")
         break

      /**
       * User asked a question for a livestream
       */
      case "LIVESTREAM_USER_ASKED_QUESTION":
         await userRepo.incrementStat(userEmail, "totalQuestionsAsked")
         break

      /**
       * User raised their hand for a livestream
       */
      case "LIVESTREAM_USER_HAND_RAISED":
         await userRepo.incrementStat(userEmail, "totalHandRaises")
         break

      /**
       * User bought a recording, add the recording id to the user's array of recordings bought
       */
      case "LIVESTREAM_RECORDING_BOUGHT":
         await userRepo.addToStatArray(
            userEmail,
            "recordingsBought",
            reward.livestreamId
         )
         break
   }
}

/**
 * When a user registers a livestream, reward the user and the one
 * who invited them
 */
export const rewardLivestreamRegistrant = async (
   documentData: UserLivestreamData,
   livestreamId: string,
   userEmail: string
) => {
   if (
      !documentData.registered.referral ||
      !documentData.registered.referral.referralCode ||
      !documentData.registered.referral.inviteLivestream
   ) {
      functions.logger.info("No referral information to reward.")
      return
   }

   if (documentData.registered.referral.inviteLivestream !== livestreamId) {
      functions.logger.info("The invite wasn't for this event, ignoring.")
      return
   }

   const userInviteOwner = await userRepo.getByReferralCode(
      documentData.registered.referral.referralCode
   )

   if (!userInviteOwner || userInviteOwner.userEmail === userEmail) {
      functions.logger.info(
         "The user owner of the invite is the same attending or does not exist."
      )
      return
   }

   const registerReward = await rewardsRepo.get(
      documentData.id,
      "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER",
      { livestreamId }
   )

   if (registerReward) {
      functions.logger.info(
         "The user has already been rewarded for this event registration."
      )
      return
   }

   await rewardCreateLivestream(
      documentData.id,
      "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER",
      userInviteOwner,
      await livestreamsRepo.getById(livestreamId)
   )
   functions.logger.info(
      "Created a new reward for the livestream registration."
   )
}

/**
 * Attributes rewards to the user based on their stats
 */
export const rewardSideEffectsUserStats = async (
   userEmail: string,
   changes: Change<DocumentSnapshot>
) => {
   // reward the user for attending their first livestream
   if (isFirstAttendance(changes)) {
      await rewardsRepo.create(userEmail, "LIVESTREAM_USER_FIRST_ATTENDED")
   }

   // reward the user for referring their first friends
   if (referredFirstFriends(changes)) {
      await rewardsRepo.create(userEmail, "REFERRAL_FIRST_FRIENDS")
   }
}

const isFirstAttendance = (changes: Change<DocumentSnapshot>) => {
   const pastLivestreamAttendances = changes.before.get(
      "totalLivestreamAttendances"
   )
   const currentLivestreamAttendances = changes.after.get(
      "totalLivestreamAttendances"
   )

   return !pastLivestreamAttendances && currentLivestreamAttendances === 1
}

const referredFirstFriends = (changes: Change<DocumentSnapshot>) => {
   const pastValue = changes.before.get("referralsCount")
   const currentValue = changes.after.get("referralsCount")

   return (
      pastValue === REFERRAL_FIRST_FRIENDS_NUM - 1 &&
      currentValue === REFERRAL_FIRST_FRIENDS_NUM
   )
}

const giveCreditsAfterFirstFriends = async (userEmail: string) => {
   const stats = await userRepo.getStats(userEmail)

   // If the user has more than 3 referrals, give him a credit for each
   // extra referral
   if (stats?.referralsCount > REFERRAL_FIRST_FRIENDS_NUM) {
      await rewardsRepo.applyCreditsToUser(
         userEmail,
         REFERRAL_AFTER_FIRST_FRIENDS_CREDITS
      )
   }
}
