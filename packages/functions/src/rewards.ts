import functions = require("firebase-functions")
import config from "./config"
import {
   userIncrementStat,
   userIncrementField,
   userUpdateFields,
} from "./lib/user"
import {
   rewardCreateReferralSignUpLeader,
   rewardCreateLivestream,
   rewardGetRelatedToLivestream,
   rewardCreateUserAction,
   rewardCreateReferralSignUpFollower,
} from "./lib/reward"
import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { livestreamsRepo, userRepo } from "./api/repositories"
import {
   RewardAction,
   RewardDoc,
   REWARDS,
} from "@careerfairy/shared-lib/rewards"

/**
 * Every time there is a new reward document, apply the reward depending on the action
 *
 * Watch-out when creating new rewards on this function, make sure it doesn't enter in infinite loop
 */
export const rewardApply = functions
   .region(config.region)
   .firestore.document("userData/{userEmail}/rewards/{rewardId}")
   .onCreate(async (snap, context) => {
      const rewardDoc = snap.data() as RewardDoc
      const email = context.params.userEmail

      const action = rewardDoc.action as RewardAction
      switch (action) {
         /**
          * When a user (follower) signup using a referral code (leader)
          */
         case "REFERRAL_SIGNUP_FOLLOWER":
            // Also reward the user owner of the referral code (leader)
            await rewardCreateReferralSignUpLeader(
               rewardDoc.userId, // leader id
               await userRepo.getUserDataById(email) // this follower data
            )

            break

         /**
          * When a user registers a livestream after being invited by someone (leader)
          */
         case "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER":
            // Also reward the user (leader) that created the invite
            await rewardCreateLivestream(
               rewardDoc.userId, // leader id
               "LIVESTREAM_REGISTER_COMPLETE_LEADER",
               await userRepo.getUserDataById(email), // this follower data
               await livestreamsRepo.getById(rewardDoc.livestreamId)
            )

            break

         /**
          * When a user attends a livestream after being invited by someone (leader)
          */
         case "LIVESTREAM_INVITE_COMPLETE_FOLLOWER":
            // Also reward the user (leader) that created the invite
            await rewardCreateLivestream(
               rewardDoc.userId, // leader id
               "LIVESTREAM_INVITE_COMPLETE_LEADER",
               await userRepo.getUserDataById(email), // this follower data
               await livestreamsRepo.getById(rewardDoc.livestreamId)
            )

            break

         /**
          * When a user (leader) referred someone with success (follower)
          * The follower sign up using the leader referral code
          */
         case "REFERRAL_SIGNUP_LEADER":
            // This user just won a new referral
            await userIncrementField(email, "referralsCount", 1)
            break

         /**
          * When a user (leader) successfully invited another user (follower) to attend a livestream
          */
         case "LIVESTREAM_INVITE_COMPLETE_LEADER":
            await userIncrementField(email, "totalLivestreamInvites", 1)
            break

         /**
          * User attended a livestream
          */
         case "LIVESTREAM_USER_ATTENDED":
            await userIncrementStat(email, "totalLivestreamAttendances")
            break

         /**
          * User asked a question for a livestream
          */
         case "LIVESTREAM_USER_ASKED_QUESTION":
            await userIncrementStat(email, "totalQuestionsAsked")
            break

         /**
          * User raised their hand for a livestream
          */
         case "LIVESTREAM_USER_HAND_RAISED":
            await userIncrementStat(email, "totalHandRaises")
            break
      }
   })

export const rewardLivestreamRegistrant = functions
   .region(config.region)
   .firestore.document(
      "livestreams/{livestreamId}/userLivestreamData/{userEmail}"
   )
   .onCreate(async (snap, context) => {
      const documentData = { ...snap.data(), id: snap.id } as UserLivestreamData

      if (
         !documentData.registered.referral ||
         !documentData.registered.referral.referralCode ||
         !documentData.registered.referral.inviteLivestream
      ) {
         functions.logger.info("No referral information to reward.")
         return
      }

      if (
         documentData.registered.referral.inviteLivestream !==
         context.params.livestreamId
      ) {
         functions.logger.info("The invite wasn't for this event, ignoring.")
         return
      }

      const userInviteOwner = await userRepo.getByReferralCode(
         documentData.registered.referral.referralCode
      )

      if (
         !userInviteOwner ||
         userInviteOwner.userEmail === context.params.userEmail
      ) {
         functions.logger.info(
            "The user owner of the invite is the same attending or does not exist."
         )
         return
      }

      const registerReward = await rewardGetRelatedToLivestream(
         documentData.id,
         context.params.livestreamId,
         "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER"
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
         await livestreamsRepo.getById(context.params.livestreamId)
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

      const userInviteOwner = await userRepo.getByReferralCode(referralCode)
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

      const livestreamDoc: any = await validateLivestreamEvent(
         livestreamId,
         userEmail,
         true
      )

      const invitationReward = await rewardGetRelatedToLivestream(
         userEmail,
         livestreamId,
         "LIVESTREAM_INVITE_COMPLETE_FOLLOWER"
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
         "LIVESTREAM_INVITE_COMPLETE_FOLLOWER",
         userInviteOwner,
         livestreamDoc
      )
      functions.logger.info(
         "Created a new reward for the livestream attendance"
      )
   }
)

/**
 * Generic function to create a reward for a user progression action
 */
export const rewardUserAction = functions.https.onCall(
   async (data, context) => {
      const userEmail = context.auth?.token?.email
      const action = data.action

      functions.logger.debug(userEmail, data)

      if (!userEmail || !action || !REWARDS[action]) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "Required data not present or invalid"
         )
      }

      const flagsToCheck = {
         livestreamMustBeLive: false,
      }

      switch (action) {
         case "LIVESTREAM_USER_ATTENDED":
         case "LIVESTREAM_USER_ASKED_QUESTION":
         case "LIVESTREAM_USER_HAND_RAISED":
            validateLivestreamIdExists(data.livestreamId)

            // this reward can only be created once per livestream
            await validateDuplicatedReward(userEmail, data.livestreamId, action)

            if (action === "LIVESTREAM_USER_ATTENDED") {
               // The livestream should be live during action
               flagsToCheck.livestreamMustBeLive = true
            }

            break
      }

      // user must be registered in the livestream event
      let livestreamDoc: LivestreamEvent
      if (data.livestreamId) {
         livestreamDoc = await validateLivestreamEvent(
            data.livestreamId,
            userEmail,
            flagsToCheck.livestreamMustBeLive
         )
      }

      // all validations have passed, create the reward for the user
      await rewardCreateUserAction(userEmail, action, livestreamDoc)
      functions.logger.info("Created a new reward for the user action")
   }
)

/**
 * Check if the referral code is valid and if the user has any, if yes, rewards the followed user
 * and adds the referral code on the current user
 */
export const applyReferralCode = functions.https.onCall(
   async (referralCode, context) => {
      const userEmail = context.auth?.token?.email

      try {
         // Extrapolate the user from the idToken that is the context
         const currentUser = await userRepo.getUserDataById(userEmail)

         const { referredBy } = currentUser

         if (referredBy) {
            throw new functions.https.HttpsError(
               "failed-precondition",
               "User already is referral by someone"
            )
         }

         // get Follower User and reward him
         const followedUser = await userRepo.getByReferralCode(referralCode)

         if (followedUser) {
            const { id, firstName, lastName } = followedUser

            // confirm that the followed user exists and is not the current user
            if (id !== userEmail) {
               const fieldToUpdate = {
                  uid: id,
                  name: `${firstName} ${lastName}`,
                  referralCode: referralCode,
               } as ReferralData

               // update user data with referredBy information
               await userUpdateFields(userEmail, {
                  referredBy: fieldToUpdate,
               })

               // apply reward to followed user
               await rewardCreateReferralSignUpFollower(userEmail, followedUser)
               functions.logger.info(
                  "Created referral follower reward for this user."
               )

               return true
            }
         }

         return false
      } catch (e) {
         functions.logger.error(e)
         throw new Error(e)
      }
   }
)

type ReferralData = {
   uid: string
   name: string
   referralCode: string
}

// Validation functions, should throw exceptions

/**
 * Validates if livestream exists, the user is registered, is live
 *
 * Throws if a condition is not met
 *
 * @param livestreamId
 * @param userMustBeRegistered
 * @param livestreamMustBeLive
 */
async function validateLivestreamEvent(
   livestreamId: string,
   userMustBeRegistered: string | null = null,
   livestreamMustBeLive = false
): Promise<LivestreamEvent> {
   const livestreamDoc = (await livestreamsRepo.getById(
      livestreamId
   )) as LivestreamEvent

   if (!livestreamDoc) {
      functions.logger.error("The livestream does not exist", {
         livestreamId,
      })
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Something wrong happened"
      )
   }

   // when testing, pass all validations
   if (livestreamDoc.test === true) {
      return livestreamDoc
   }

   if (
      livestreamMustBeLive &&
      (!livestreamDoc.hasStarted || livestreamDoc.hasEnded)
   ) {
      functions.logger.error("The livestream is not live or does not exist", {
         livestreamDoc,
      })
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Something wrong happened"
      )
   }

   if (
      userMustBeRegistered &&
      !livestreamDoc.registeredUsers?.includes(userMustBeRegistered)
   ) {
      functions.logger.error(
         "The user is not registered in the livestream, someone trying to hack us?",
         {
            userMustBeRegistered,
            livestreamDoc,
            livestreamId,
         }
      )
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Something wrong happened"
      )
   }

   return livestreamDoc
}

/**
 * Confirm the livestreamId exists or throw an exception
 * @param livestreamId
 */
function validateLivestreamIdExists(livestreamId: string) {
   if (!livestreamId) {
      functions.logger.error("The livestream is required")
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Something wrong happened"
      )
   }
}

/**
 * Validate if the reward was already given to the user
 * Related to a livestream
 *
 * @param userEmail
 * @param livestreamId
 * @param action
 */
async function validateDuplicatedReward(
   userEmail: string,
   livestreamId: string,
   action: RewardAction
) {
   const previousReward = await rewardGetRelatedToLivestream(
      userEmail,
      livestreamId,
      action
   )

   if (previousReward) {
      functions.logger.error("The user already received this award, ignoring")
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Duplicated" // client side can watch for duplicated errors
      )
   }

   return previousReward
}
