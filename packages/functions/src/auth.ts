import functions = require("firebase-functions")
import { admin } from "./api/firestoreAdmin"
import { UserData } from "@careerfairy/shared-lib/users"
import { generateReferralCode } from "./util"
import { groupRepo, marketingUsersRepo, userRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import {
   GroupDashboardInvite,
   NO_EMAIL_ASSOCIATED_WITH_INVITE_ERROR_MESSAGE,
} from "@careerfairy/shared-lib/groups/GroupDashboardInvite"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import config from "./config"
import { INITIAL_CREDITS } from "@careerfairy/shared-lib/rewards"
import { userUpdateFields } from "./lib/user"
import { client } from "./api/postmark"

export const createNewUserAccount = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      if (context.auth) {
         // Throwing an HttpsError so that the client gets the error details.
         throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while logged out."
         )
      }

      const userData = data.userData
      const recipientEmail = data.userData.email.toLowerCase().trim()
      const pinCode = getRandomInt(9999)
      const {
         password,
         firstName,
         lastName,
         university,
         universityCountryCode,
         subscribed,
         gender = "",
         fieldOfStudy = null,
         levelOfStudy = null,
         accountCreationUTMParams = {},
      } = userData

      console.log(
         `Starting auth account creation process for ${recipientEmail}`
      )
      await admin
         .auth()
         .createUser({ email: recipientEmail, password: password })
         .then(async (user) => {
            console.log(
               `Starting firestore account creation process for ${recipientEmail}`
            )

            const registrationUTMsToSave =
               Object.keys(accountCreationUTMParams).length > 0
                  ? { accountCreationUTMParams }
                  : {}

            await admin
               .firestore()
               .collection("userData")
               .doc(recipientEmail)
               .set(
                  Object.assign({
                     authId: user.uid,
                     id: recipientEmail,
                     validationPin: pinCode,
                     firstName: firstName,
                     lastName: lastName,
                     userEmail: recipientEmail,
                     university: university,
                     universityCountryCode: universityCountryCode,
                     unsubscribed: !subscribed,
                     referralCode: generateReferralCode(),
                     gender: gender,
                     fieldOfStudy,
                     levelOfStudy,
                     isStudent: true,
                     credits: INITIAL_CREDITS,
                     lastActivityAt:
                        admin.firestore.FieldValue.serverTimestamp(),
                     createdAt: admin.firestore.FieldValue.serverTimestamp(),
                     ...registrationUTMsToSave,
                  })
               )
               .then(async () => {
                  try {
                     await marketingUsersRepo.delete(recipientEmail)
                  } catch (e) {
                     functions.logger.warn(
                        `Unable to deleting marketing user: ${recipientEmail}, could be because it doesn't exist`,
                        e
                     )
                  }
               })
               .then(async () => {
                  console.log(`Starting sending email for ${recipientEmail}`)
                  const email = {
                     TemplateId: Number(
                        process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION
                     ),
                     From: "CareerFairy <noreply@careerfairy.io>",
                     To: recipientEmail,
                     TemplateModel: { pinCode: pinCode },
                  }
                  try {
                     const response = await client.sendEmailWithTemplate(email)
                     console.log(
                        `Sent email successfully for ${recipientEmail}`
                     )

                     return response
                  } catch (error) {
                     console.error(
                        `Error sending PIN email to ${recipientEmail}`,
                        error
                     )
                     console.error(
                        `Starting auth and firestore user deletion ${recipientEmail}`,
                        error
                     )
                     await admin.auth().deleteUser(user.uid)
                     await admin
                        .firestore()
                        .collection("userData")
                        .doc(recipientEmail)
                        .delete()
                     throw new functions.https.HttpsError(
                        "resource-exhausted",
                        "Error sending out PIN email"
                     )
                  }
               })
               .catch(async (error) => {
                  if (error.code !== "resource-exhausted") {
                     console.error(
                        `Starting auth user deletion ${recipientEmail}`,
                        error
                     )
                     await admin.auth().deleteUser(user.uid)
                  }
                  console.error(
                     `Error creating user ${recipientEmail} in firestore`,
                     error
                  )
                  throw new functions.https.HttpsError("internal", error)
               })
         })
         .catch(async (error) => {
            console.error(
               `Error creating user ${recipientEmail} in firebase auth`,
               error
            )
            throw new functions.https.HttpsError("internal", error)
         })
   })
export const createNewGroupAdminUserAccount = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      if (context.auth) {
         // Throwing an HttpsError so that the client gets the error details.
         throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while logged out."
         )
      }
      let uidToDelete = null
      let emailToDelete = null
      const userData = data.userData
      const recipientEmail = userData.email.toLowerCase().trim()

      const { password, firstName, lastName, subscribed } = userData

      try {
         console.log(
            `Starting admin auth account creation process for ${recipientEmail}`
         )
         // Check if email is associated with a valid group dashboard invite
         const invitation: GroupDashboardInvite =
            await groupRepo.getDashboardInvite(recipientEmail)

         if (!invitation) {
            logAndThrow(NO_EMAIL_ASSOCIATED_WITH_INVITE_ERROR_MESSAGE, {
               recipientEmail,
            })
         }

         const group = await groupRepo.getGroupById(invitation.groupId)

         if (!group) {
            logAndThrow("The group you are trying to join does not exist", {
               groupId: invitation.groupId,
            })
         }

         // Create user in firebase auth
         const userRecord = await admin.auth().createUser({
            displayName: [firstName, lastName].filter((name) => name).join(" "),
            email: recipientEmail,
            password: password,
            emailVerified: true, // Email is verified by default since the user is invited by an admin
         })

         // set the group role to the user
         await admin.auth().setCustomUserClaims(userRecord.uid, {
            adminGroups: {
               [invitation.groupId]: {
                  role: invitation.role,
               },
            },
         })

         // store the uid in case we need to delete it later
         uidToDelete = userRecord.uid

         const userData = {
            authId: userRecord.uid,
            id: recipientEmail,
            firstName: firstName,
            lastName: lastName,
            userEmail: recipientEmail,
            unsubscribed: !subscribed,
            referralCode: generateReferralCode(),
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
         }
         // create the user in firestore, if it fails, delete the user from firebase auth
         await admin
            .firestore()
            .collection("userData")
            .doc(recipientEmail)
            .set(Object.assign(userData))

         // Set the roles in firestore
         await groupRepo.setGroupAdminRoleInFirestore(
            group,
            userData,
            invitation.role
         )

         emailToDelete = recipientEmail

         // Delete the user from the marketing list if they exist, this is not a critical step, so we don't throw an error if it fails
         await marketingUsersRepo.delete(recipientEmail).catch((e) => {
            functions.logger.warn(
               `Unable to deleting marketing user: ${recipientEmail}, could be because it doesn't exist`,
               e
            )
         })

         await groupRepo // Delete the invite from the group dashboard invites collection, and don't throw an error if it fails
            .deleteGroupDashboardInviteById(invitation.id)
            .catch((e) => {
               functions.logger.warn(
                  `Unable to delete group dashboard invite: ${invitation.id}, could be because it doesn't exist`,
                  e
               )
            })

         return group // Return the group so that the client can redirect to the group dashboard
      } catch (error) {
         // if any of the steps above fail, we need to delete the user from firebase auth and firestore
         functions.logger.error(
            `Error creating user ${recipientEmail} in firebase auth. Attempting to delete user and auth record... `,
            error
         )
         // Delete the user from firebase auth
         const deletePromises: Promise<any>[] = []

         if (emailToDelete) {
            deletePromises.push(
               admin
                  .firestore()
                  .collection("userData")
                  .doc(recipientEmail)
                  .delete()
            )
         }
         if (uidToDelete) {
            // if we have a UID to delete, we delete the auth record
            deletePromises.push(admin.auth().deleteUser(uidToDelete))
         }
         // wait for all the promises to resolve
         await Promise.all(deletePromises)

         // Throw the original critical error
         throw new functions.https.HttpsError("internal", error)
      }
   })

// eslint-disable-next-line camelcase
export const resendPostmarkEmailVerificationEmailWithPin = functions
   .region(config.region)
   .https.onCall(async (data) => {
      const recipientEmail = data.recipientEmail
      const pinCode = getRandomInt(9999)

      await admin
         .firestore()
         .collection("userData")
         .doc(recipientEmail)
         .update({ validationPin: pinCode })

      const email = {
         TemplateId: Number(process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION),
         From: "CareerFairy <noreply@careerfairy.io>",
         To: recipientEmail,
         TemplateModel: { pinCode: pinCode },
      }
      try {
         await client.sendEmailWithTemplate(email)
      } catch (e) {
         throw new functions.https.HttpsError("invalid-argument", e)
      }
   })

export const validateUserEmailWithPin = functions
   .region(config.region)
   .runWith({
      minInstances: 1,
   })
   .https.onCall(async (data) => {
      const recipientEmail = data.userInfo.recipientEmail
      const pinCode = data.userInfo.pinCode
      let error: any

      functions.logger.log(
         `Starting user email validation for ${recipientEmail}`
      )

      try {
         const querySnapshot = await admin
            .firestore()
            .collection("userData")
            .doc(recipientEmail)
            .get()
         if (querySnapshot.exists) {
            const user = querySnapshot.data()
            functions.logger.log(`Acquired user data for ${recipientEmail}`)
            if (user.validationPin === pinCode) {
               functions.logger.log(
                  `Provided Pin code for ${recipientEmail} is correct`
               )
               const userRecord = await admin
                  .auth()
                  .getUserByEmail(recipientEmail)

               const updatedUserRecord = await admin
                  .auth()
                  .updateUser(userRecord.uid, {
                     emailVerified: true,
                  })

               functions.logger.log(
                  `Auth user ${recipientEmail} has been validated`
               )

               functions.logger.log("Updated User Record", updatedUserRecord)

               // after pin confirmation send welcome email
               functions.logger.log(
                  `Starting sending welcome email to  ${recipientEmail}`
               )
               const email = {
                  TemplateId: Number(
                     process.env.POSTMARK_TEMPLATE_WELCOME_EMAIL
                  ),
                  From: "CareerFairy <noreply@careerfairy.io>",
                  To: recipientEmail,
                  TemplateModel: {
                     user_name: user.firstName,
                  },
               }

               try {
                  const response = await client.sendEmailWithTemplate(email)

                  if (response.ErrorCode) {
                     functions.logger.error(
                        `An error has occurred sending welcome email to ${recipientEmail}`
                     )
                  } else {
                     functions.logger.log(
                        `The welcome email was sent successfully to ${recipientEmail}`
                     )
                  }
               } catch (error) {
                  functions.logger.error(
                     `An error has occurred sending welcome email to ${recipientEmail}`
                  )
               }

               return updatedUserRecord
            } else {
               functions.logger.warn(
                  `The User ${recipientEmail} has failed to provide the correct Pin code, provided ${pinCode} instead of ${user.validationPin}`
               )
               error = {
                  code: "invalid-argument",
                  message: "Failed to provide the correct Pin code",
               }
            }
         } else {
            functions.logger.error(
               `Was unable to find any userData with ${recipientEmail}`
            )
            error = {
               code: "not-found",
               message: `Was unable to find any userData with ${recipientEmail}`,
            }
         }
      } catch (error) {
         functions.logger.warn(
            `An error has occurred fetching userData for ${recipientEmail}`
         )
         throw new functions.https.HttpsError("unknown", error)
      }

      if (error) {
         throw new functions.https.HttpsError(error.code, error.message)
      }
      return null
   })

export const sendPostmarkResetPasswordEmail = functions
   .region(config.region)
   .https.onCall(async (data) => {
      const recipientEmail = data?.recipientEmail?.trim()

      if (!recipientEmail) {
         functions.logger.error(
            `Invalid email address: ${recipientEmail}`,
            data
         )

         // someone bypassed the client side validation
         return null
      }

      try {
         const redirectLink = data.redirectLink

         const actionCodeSettings = {
            url: redirectLink,
         }

         functions.logger.info("recipientEmail", recipientEmail)
         functions.logger.info("actionCodeSettings", actionCodeSettings)

         const link = await admin
            .auth()
            .generatePasswordResetLink(recipientEmail, actionCodeSettings)

         const email = {
            TemplateId: Number(process.env.POSTMARK_TEMPLATE_PASSWORD_RESET),
            From: "CareerFairy <noreply@careerfairy.io>",
            To: recipientEmail,
            TemplateModel: { action_url: addUtmTagsToLink({ link: link }) },
         }

         const response = await client.sendEmailWithTemplate(email)
         functions.logger.info("response", response)

         if (response.ErrorCode) {
            functions.logger.error(
               "error in sendEmailWithTemplate response",
               response
            )
         }
      } catch (e) {
         functions.logger.error(
            `Error in sending password reset link with email ${recipientEmail}`,
            e
         )
         // The client should not know if this request was successful or not, so we just log it on the server
      }
   })

export const backfillUserData = functions
   .region(config.region)
   .https.onCall(async ({ timezone }, context) => {
      const email = context?.auth?.token?.email
      functions.logger.debug(email, context?.auth)

      if (!email) {
         functions.logger.error(
            "The user calling the function is not authenticated"
         )
         throw new functions.https.HttpsError(
            "invalid-argument",
            "Something wrong happened"
         )
      }

      const userData = await userRepo.getUserDataById(email)
      const dataToUpdate: Partial<UserData> = {}

      if (!userData.referralCode) {
         dataToUpdate.referralCode = generateReferralCode()
         functions.logger.info("Adding referralCode to user")
      }

      // if there's no timezone it will save the current timezone provided by the browser
      if (!userData.timezone) {
         dataToUpdate.timezone = timezone
         functions.logger.info("Adding time zone to user")
      }

      if (Object.keys(dataToUpdate).length > 0) {
         await userUpdateFields(email, dataToUpdate)
         functions.logger.info(
            "User updated with the following fields",
            dataToUpdate
         )
      }
   })

export const deleteLoggedInUserAccount = functions
   .region(config.region)
   .https.onCall(async (_, context) => {
      const { auth } = context
      const {
         token: { email: userEmail, uid: userId },
      } = auth

      if (!auth || !userEmail || !userId) {
         // Throwing an HttpsError so that the client gets the error details.
         throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while logged in."
         )
      }

      try {
         await admin.auth().deleteUser(userId)
         await admin.firestore().collection("userData").doc(userEmail).delete()

         // add userId and timestamp on analytics collection
         await admin
            .firestore()
            .collection("analytics")
            .doc("deletedUsers")
            .collection("deletedUsers")
            .doc(userId)
            .set({
               userId: userId,
               timeStamp: admin.firestore.FieldValue.serverTimestamp(),
            })

         functions.logger.info(
            `User ${userEmail} with the id ${userId} was deleted successfully`
         )
      } catch (error) {
         console.error(
            `Error deleting user ${userEmail} with the id ${userId} in firestore`,
            error
         )
         throw new functions.https.HttpsError(error.code, error.message)
      }
   })

const getRandomInt = (max: number) => {
   const variable = Math.floor(Math.random() * Math.floor(max))
   if (variable < 1000) {
      return variable + 1000
   } else {
      return variable
   }
}
