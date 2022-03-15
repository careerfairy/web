const functions = require("firebase-functions")
const config = require("./config")
const {
   userAddPoints,
   userIncrementReferralsCount,
   userGetByReferralCode,
   userGetByEmail,
} = require("./lib/user")
const { RewardActions } = require("./shared/rewards")
const {
   rewardCreateReferralSignUpLeader,
   rewardCreateLivestreamInviteCompleteLeader,
   rewardGetInvitationForLivestream,
   rewardCreateLivestreamInviteCompleteFollower,
} = require("./lib/reward")
const { livestreamGetById } = require("./lib/livestream")

/**
 * Everytime there is a new reward document, apply the reward depending on the action
 *
 * Watch-out when creating new rewards on this function, make sure it doesn't enter in infinite loop
 */
exports.rewardApply = functions
   .region(config.region)
   .firestore.document("userData/{userEmail}/rewards/{rewardId}")
   .onCreate(async (snap, context) => {
      const rewardDoc = snap.data()
      const email = context.params.userEmail

      // Apply points to the user owner of the reward
      await userAddPoints(email, rewardDoc.points)
      functions.logger.info(
         `Added ${rewardDoc.points} points to ${email} for ${rewardDoc.action}`
      )

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
          * When a user attends a livestream after being invited by someone (leader)
          */
         case RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER:
            // Also reward the user (leader) that created the invite
            await rewardCreateLivestreamInviteCompleteLeader(
               rewardDoc.userId, // leader id
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

exports.rewardLivestreamAttendance = functions.https.onCall(
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
      if (!userInviteOwner || userInviteOwner.id === userEmail) {
         functions.logger.error(
            `Invalid referral user! Referral Code: ${referralCode}`
         )
         throw new functions.https.HttpsError(
            "failed-precondition",
            // generic error message on purpose, we can't give clues to the ones trying to bypass
            "Something wrong happened"
         )
      }

      const livestreamDoc = await livestreamGetById(livestreamId)
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

      const invitationReward = await rewardGetInvitationForLivestream(
         userEmail,
         livestreamId
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
      await rewardCreateLivestreamInviteCompleteFollower(
         userEmail,
         userInviteOwner,
         livestreamDoc
      )
      functions.logger.info(
         "Created a new reward for the livestream attendance"
      )
   }
)
