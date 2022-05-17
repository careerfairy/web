import functions = require("firebase-functions")
import config = require("./config")
import {
   userIncrementReferralsCount,
   userGetByReferralCode,
   userGetByEmail,
} from "./lib/user"
import { RewardActions } from "@careerfairy/shared-lib/dist/rewards"
import {
   rewardCreateReferralSignUpLeader,
   rewardCreateLivestream,
   rewardGetRelatedToLivestream,
} from "./lib/reward"
import { livestreamGetById } from "./lib/livestream"

/**
 * Everytime there is a new reward document, apply the reward depending on the action
 *
 * Watch-out when creating new rewards on this function, make sure it doesn't enter in infinite loop
 */
export const rewardApply = functions
   .region(config.region)
   .firestore.document("userData/{userEmail}/rewards/{rewardId}")
   .onCreate(async (snap, context) => {
      const rewardDoc = snap.data()
      const email = context.params.userEmail

      switch (rewardDoc.action) {
         /**
          * When a user (follower) signup using a referral code (leader)
          */
         case RewardActions.REFERRAL_SIGNUP_FOLLOWER:
            // Also reward the user owner of the referral code (leader)
            await rewardCreateReferralSignUpLeader(
               rewardDoc.userId, // leader id
               await userGetByEmail(email) // this follower data
            )

            break

         /**
          * When a user registers a livestream after being invited by someone (leader)
          */
         case RewardActions.LIVESTREAM_REGISTER_COMPLETE_FOLLOWER:
            // Also reward the user (leader) that created the invite
            await rewardCreateLivestream(
               rewardDoc.userId, // leader id
               RewardActions.LIVESTREAM_REGISTER_COMPLETE_LEADER,
               await userGetByEmail(email), // this follower data
               await livestreamGetById(rewardDoc.livestreamId)
            )

            break

         /**
          * When a user attends a livestream after being invited by someone (leader)
          */
         case RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER:
            // Also reward the user (leader) that created the invite
            await rewardCreateLivestream(
               rewardDoc.userId, // leader id
               RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER,
               await userGetByEmail(email), // this follower data
               await livestreamGetById(rewardDoc.livestreamId)
            )

            break

         /**
          * When a user (leader) referred someone with success (follower)
          * The follower sign up using the leader referral code
          */
         case RewardActions.REFERRAL_SIGNUP_LEADER:
            // This user just won a new referral
            await userIncrementReferralsCount(email)
            break

         /**
          * When a user (leader) successfully invited another user (follower) to attend a livestream
          */
         case RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER:
            // nothing to do (points have already been applied)
            break
      }
   })

export const rewardLivestreamRegistrant = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}/registrants/{userId}")
   .onCreate(async (snap, context) => {
      const documentData = snap.data()

      if (
         !documentData.referral ||
         !documentData.referral.referralCode ||
         !documentData.referral.inviteLivestream
      ) {
         functions.logger.info("No referral information to reward.")
         return
      }

      if (
         documentData.referral.inviteLivestream !== context.params.livestreamId
      ) {
         functions.logger.info("The invite wasn't for this event, ignoring.")
         return
      }

      const userInviteOwner = await userGetByReferralCode(
         documentData.referral.referralCode
      )

      if (
         !userInviteOwner ||
         userInviteOwner.authId === context.params.userId
      ) {
         functions.logger.info(
            "The user owner of the invite is the same attending or does not exist."
         )
         return
      }

      const registerReward = await rewardGetRelatedToLivestream(
         documentData.id,
         context.params.livestreamId,
         RewardActions.LIVESTREAM_REGISTER_COMPLETE_FOLLOWER
      )

      if (registerReward) {
         functions.logger.info(
            "The user has already been rewarded for this event registration."
         )
         return
      }

      await rewardCreateLivestream(
         documentData.id,
         RewardActions.LIVESTREAM_REGISTER_COMPLETE_FOLLOWER,
         userInviteOwner,
         await livestreamGetById(context.params.livestreamId)
      )
      functions.logger.info(
         "Created a new reward for the livestream registration."
      )
   })

export const rewardLivestreamAttendance = functions.https.onCall(
   async (data, context) => {
      const userEmail = context.auth?.token?.email
      const livestreamId = data.livestreamId
      const referralCode = data.referralCode

      functions.logger.debug(userEmail, livestreamId, referralCode)

      if (!userEmail || !referralCode || !livestreamId) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "Required data not present"
         )
      }

      const userInviteOwner = await userGetByReferralCode(referralCode)
      if (!userInviteOwner) {
         functions.logger.error(
            `There isn't a user owner of the Referral Code: ${referralCode}.`
         )
         throw new functions.https.HttpsError(
            "failed-precondition",
            // generic error message on purpose, we can't give clues to the ones trying to bypass
            "Something wrong happened"
         )
      }

      if (userInviteOwner.id === userEmail) {
         functions.logger.error(
            `User invited himself to the event, referralCode: ${referralCode}.`
         )
         throw new functions.https.HttpsError(
            "failed-precondition",
            // generic error message on purpose, we can't give clues to the ones trying to bypass
            "Something wrong happened"
         )
      }

      const livestreamDoc: any = await livestreamGetById(livestreamId)
      if (
         !livestreamDoc ||
         !livestreamDoc.hasStarted ||
         livestreamDoc.hasEnded
      ) {
         functions.logger.error("The livestream is not live or does not exist")
         throw new functions.https.HttpsError(
            "failed-precondition",
            "Something wrong happened"
         )
      }

      if (!livestreamDoc.registeredUsers?.includes(userEmail)) {
         functions.logger.error(
            "The user is not registered in the livestream, someone trying to hack us?"
         )
         throw new functions.https.HttpsError(
            "failed-precondition",
            "Something wrong happened"
         )
      }

      const invitationReward = await rewardGetRelatedToLivestream(
         userEmail,
         livestreamId,
         RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER
      )

      if (invitationReward) {
         functions.logger.error(
            "The user already received this award, ignoring"
         )
         throw new functions.https.HttpsError(
            "failed-precondition",
            "Duplicated" // client side can watch for duplicated errors
         )
      }

      // TODO: check for invitations on livestreamEmailInvites collection (when referralCode is missing)

      // all validations have passed, create the reward for the user
      await rewardCreateLivestream(
         userEmail,
         RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER,
         userInviteOwner,
         livestreamDoc
      )
      functions.logger.info(
         "Created a new reward for the livestream attendance"
      )
   }
)
