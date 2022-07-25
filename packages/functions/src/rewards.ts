import functions = require("firebase-functions")
import config = require("./config")
import {
   userGetByReferralCode,
   userGetByEmail,
   userIncrementStat,
   userIncrementField,
} from "./lib/user"
import { RewardActions } from "@careerfairy/shared-lib/dist/rewards"
import {
   rewardCreateReferralSignUpLeader,
   rewardCreateLivestream,
   rewardGetRelatedToLivestream,
   rewardCreateUserAction,
   rewardCreateReferralSignUpFollower,
} from "./lib/reward"
import { livestreamGetById } from "./lib/livestream"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { admin } from "./api/firestoreAdmin"

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
            await userIncrementField(email, "referralsCount", 1)
            break

         /**
          * When a user (leader) successfully invited another user (follower) to attend a livestream
          */
         case RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER:
            await userIncrementField(email, "totalLivestreamInvites", 1)
            break

         /**
          * User attended a livestream
          */
         case RewardActions.LIVESTREAM_USER_ATTENDED:
            await userIncrementStat(email, "totalLivestreamAttendances")
            break

         /**
          * User asked a question for a livestream
          */
         case RewardActions.LIVESTREAM_USER_ASKED_QUESTION:
            await userIncrementStat(email, "totalQuestionsAsked")
            break

         /**
          * User raised their hand for a livestream
          */
         case RewardActions.LIVESTREAM_USER_HAND_RAISED:
            await userIncrementStat(email, "totalHandRaises")
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

      const livestreamDoc: any = await validateLivestreamEvent(
         livestreamId,
         userEmail,
         true
      )

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

/**
 * Generic function to create a reward for a user progression action
 */
export const rewardUserAction = functions.https.onCall(
   async (data, context) => {
      const userEmail = context.auth?.token?.email
      const action = data.action

      functions.logger.debug(userEmail, data)

      if (!userEmail || !action || !RewardActions[action]) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "Required data not present or invalid"
         )
      }

      const flagsToCheck = {
         livestreamMustBeLive: false,
      }

      switch (action) {
         case RewardActions.LIVESTREAM_USER_ATTENDED:
         case RewardActions.LIVESTREAM_USER_ASKED_QUESTION:
         case RewardActions.LIVESTREAM_USER_HAND_RAISED:
            validateLivestreamIdExists(data.livestreamId)

            // this reward can only be created once per livestream
            await validateDuplicatedReward(userEmail, data.livestreamId, action)

            if (action === RewardActions.LIVESTREAM_USER_ATTENDED) {
               // The livestream should be live during action
               flagsToCheck.livestreamMustBeLive = true
            }

            break
      }

      // user must be registered in the livestream event
      let livestreamDoc
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
export const rewardSignUpFollower = functions.https.onCall(
   async (referralCode, context) => {
      const userEmail = context.auth?.token?.email

      try {
         // Extrapolate the user from the idToken that is the context
         const currentUser = await getUserById(userEmail)
         const { referredBy } = currentUser

         if (referredBy) {
            throw new functions.https.HttpsError(
               "failed-precondition",
               "User already is referral by someone"
            )
         }

         // get Follower User and reward him
         const followedUser = await getUserByReferralCode(referralCode)

         if (followedUser) {
            const { id, firstName, lastName } = followedUser

            // confirm that the followed user exists and is not the current user
            if (followedUser && id !== userEmail) {
               const fieldToUpdate = {
                  uid: id,
                  name: `${firstName} ${lastName}`,
                  referralCode: referralCode,
               } as ReferralData

               await rewardCreateReferralSignUpFollower(userEmail, followedUser)
               functions.logger.info(
                  "Created referral follower reward for this user."
               )

               return fieldToUpdate
            }
         }

         return null
      } catch (e) {
         functions.logger.error(e)
         throw new Error(e)
      }
   }
)
// get user by id
const getUserById = async (userId) => {
   const snap = await admin.firestore().collection("userData").doc(userId).get()

   if (!snap.exists) {
      return null
   }

   return snap.data() as UserData
}

type ReferralData = {
   uid: string
   name: string
   referralCode: string
}

// Get User by referral code
const getUserByReferralCode = async (referralCode): Promise<UserData> => {
   const snap = await admin
      .firestore()
      .collection("userData")
      .where("referralCode", "==", referralCode)
      .limit(1)
      .get()

   if (snap.empty) {
      return null
   }

   return snap.docs[0].data() as UserData
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
   const livestreamDoc = (await livestreamGetById(
      livestreamId
   )) as LivestreamEvent

   if (!livestreamDoc) {
      functions.logger.error("The livestream does not exist")
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
      functions.logger.error("The livestream is not live or does not exist")
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
         "The user is not registered in the livestream, someone trying to hack us?"
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
function validateLivestreamIdExists(livestreamId) {
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
async function validateDuplicatedReward(userEmail, livestreamId, action) {
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
