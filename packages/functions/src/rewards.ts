import functions = require("firebase-functions")
import {
   rewardCreateLivestream,
   rewardCreateUserAction,
   rewardCreateReferralSignUpFollower,
} from "./lib/reward"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamsRepo, rewardsRepo, userRepo } from "./api/repositories"
import { RewardAction, REWARDS } from "@careerfairy/shared-lib/rewards"
import { userUpdateFields } from "./lib/user"
import { RewardFilterFields } from "@careerfairy/shared-lib/rewards/RewardRepository"
import config from "./config"

/**
 * Reward user for being invited to a livestream and participating
 *
 * The reward LIVESTREAM_USER_ATTENDED is also given to the user
 */
export const rewardLivestreamInvitationComplete = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
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

      const livestreamDoc: any = await validateLivestreamEvent(livestreamId, {
         userMustBeRegistered: userEmail,
         livestreamMustBeLive: true,
      })

      validateDuplicatedReward(
         userEmail,
         "LIVESTREAM_INVITE_COMPLETE_FOLLOWER",
         { livestreamId }
      )

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
   })

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

      const flagsToCheck: LivestreamValidationFlags = {}

      switch (action) {
         case "LIVESTREAM_USER_ATTENDED":
         case "LIVESTREAM_USER_ASKED_QUESTION":
         case "LIVESTREAM_USER_HAND_RAISED":
         case "LIVESTREAM_RECORDING_BOUGHT":
            validateLivestreamIdExists(data.livestreamId)

            // this reward can only be created once per livestream
            await validateDuplicatedReward(userEmail, action, {
               livestreamId: data.livestreamId,
            })

            if (action === "LIVESTREAM_USER_ATTENDED") {
               // The livestream should be live during this action
               flagsToCheck.livestreamMustBeLive = true
            }

            if (action === "LIVESTREAM_RECORDING_BOUGHT") {
               // The livestream can't have the deny recording flag set
               flagsToCheck.recordingShouldBeAccessible = true
            }

            break
         case "USER_CV_UPLOAD":
            // this reward can only be created once per user
            await validateDuplicatedReward(userEmail, action)
            break
      }

      // if the reward is related to a livestream, validate the livestream
      let livestreamDoc: LivestreamEvent
      if (data.livestreamId) {
         livestreamDoc = await validateLivestreamEvent(
            data.livestreamId,
            flagsToCheck
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
export const applyReferralCode = functions
   .region(config.region)
   .https.onCall(async (referralCode, context) => {
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
   })

type ReferralData = {
   uid: string
   name: string
   referralCode: string
}

type LivestreamValidationFlags = {
   livestreamMustBeLive?: boolean
   userMustBeRegistered?: string | undefined
   recordingShouldBeAccessible?: boolean
}

// Validation functions, should throw exceptions

/**
 * Validation logic related to the livestream
 *
 * Throws if a condition is not met
 */
async function validateLivestreamEvent(
   livestream: string | LivestreamEvent,
   flags: LivestreamValidationFlags
): Promise<LivestreamEvent> {
   let livestreamDoc = typeof livestream === "string" ? null : livestream

   if (!livestreamDoc) {
      livestreamDoc = (await livestreamsRepo.getById(
         livestream as string
      )) as LivestreamEvent
   }

   if (!livestreamDoc) {
      functions.logger.error("The livestream does not exist", {
         livestream,
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
      flags.livestreamMustBeLive &&
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
      flags.userMustBeRegistered &&
      !livestreamDoc.registeredUsers?.includes(flags.userMustBeRegistered)
   ) {
      functions.logger.error(
         "The user is not registered in the livestream, someone trying to hack us?",
         {
            email: flags.userMustBeRegistered,
            livestreamDoc,
            livestream,
         }
      )
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Something wrong happened"
      )
   }

   if (flags.recordingShouldBeAccessible && livestreamDoc.denyRecordingAccess) {
      functions.logger.error(
         "The livestream doesn't have the recoding accessible, buy action not granted",
         {
            livestreamDoc,
            livestream,
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
 */
async function validateDuplicatedReward(
   userEmail: string,
   action: RewardAction,
   filters?: RewardFilterFields
) {
   const previousReward = await rewardsRepo.get(userEmail, action, filters)

   if (previousReward) {
      functions.logger.error("The user already received this award, ignoring")
      throw new functions.https.HttpsError(
         "failed-precondition",
         "Duplicated" // client side can watch for duplicated errors
      )
   }

   return previousReward
}
