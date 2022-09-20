import functions = require("firebase-functions")

import userLib = require("./lib/user")
import config = require("./config")
/* eslint-disable @typescript-eslint/no-var-requires */
const { client } = require("./api/postmark")
import { admin } from "./api/firestoreAdmin"

import { UserData, UserStats } from "@careerfairy/shared-lib/dist/users"
import { generateReferralCode, setHeaders } from "./util"
import { handleUserNetworkerBadges, handleUserStatsBadges } from "./lib/badge"
import { groupRepo, marketingUsersRepo } from "./api/repositories"

const getRandomInt = (max) => {
   const variable = Math.floor(Math.random() * Math.floor(max))
   if (variable < 1000) {
      return variable + 1000
   } else {
      return variable
   }
}

// eslint-disable-next-line camelcase
export const createNewUserAccount_v4 = functions.https.onCall(
   async (data, context) => {
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
                     TemplateId:
                        process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION,
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
   }
)
export const createNewGroupAdminUserAccount = functions.https.onCall(
   async (data, context) => {
      if (context.auth) {
         // Throwing an HttpsError so that the client gets the error details.
         throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while logged out."
         )
      }

      let uidToDelete = null
      const userData = data.userData
      const groupId = data.groupId
      const recipientEmail = data.userData.email.toLowerCase().trim()
      const pinCode = getRandomInt(9999)
      const { password, firstName, lastName, subscribed } = userData
      try {
         console.log(
            `Starting auth account creation process for ${recipientEmail}`
         )
         // check if group exists
         await groupRepo.getGroupById(groupId).then((group) => {
            if (!group) {
               throw new functions.https.HttpsError(
                  "not-found",
                  "Group not found"
               )
            }
            return group
         })

         // Create user in firebase auth
         const userRecord = await admin
            .auth()
            .createUser({ email: recipientEmail, password: password })
         // store the uid in case we need to delete it later
         uidToDelete = userRecord.uid

         // create the user in firestore, if it fails, delete the user from firebase auth
         await admin
            .firestore()
            .collection("userData")
            .doc(recipientEmail)
            .set(
               Object.assign({
                  authId: userRecord.uid,
                  id: recipientEmail,
                  validationPin: pinCode,
                  firstName: firstName,
                  lastName: lastName,
                  userEmail: recipientEmail,
                  unsubscribed: !subscribed,
                  referralCode: generateReferralCode(),
               })
            )

         // grant the user admin access to the group
         await grantGroupAdminRole(userRecord.email, groupId).catch((error) => {
            functions.logger.error(
               `Error granting group admin role to ${recipientEmail} for group ${groupId}`,
               error
            )
            throw new functions.https.HttpsError("internal", error)
         })

         // Delete the user from the marketing list if they exist, this is not a critical step, so we don't throw an error if it fails
         await marketingUsersRepo.delete(recipientEmail).catch((e) => {
            functions.logger.warn(
               `Unable to deleting marketing user: ${recipientEmail}, could be because it doesn't exist`,
               e
            )
         })

         // Send the verification email, if this fails we throw and need to delete the user from firebase auth and firestore
         await sendVerificationEmail({
            email: recipientEmail,
            uid: userRecord.uid,
            pinCode,
         }).catch((error) => {
            functions.logger.error(
               `Error sending PIN email to ${recipientEmail}`,
               error
            )
            throw new functions.https.HttpsError("internal", error)
         })
      } catch (error) {
         // if any of the steps above fail, we need to delete the user from firebase auth and firestore
         functions.logger.error(
            `Error creating user ${recipientEmail} in firebase auth. Attempting to delete user and auth record... `,
            error
         )
         // Delete the user from firebase auth
         const deletePromises: Promise<any>[] = [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore // Promise<any> is not assignable to  Promise<admin.firestore.WriteResult>
            await admin
               .firestore()
               .collection("userData")
               .doc(recipientEmail)
               .delete(),
         ]
         if (uidToDelete) {
            // if we have a uid to delete, we delete the auth record
            deletePromises.push(admin.auth().deleteUser(uidToDelete))
         }
         // wait for all the promises to resolve
         await Promise.all(deletePromises)

         // Throw the original critical error
         throw new functions.https.HttpsError("internal", error)
      }
   }
)

// eslint-disable-next-line camelcase
export const resendPostmarkEmailVerificationEmailWithPin_v2 =
   functions.https.onCall(async (data) => {
      const recipientEmail = data.recipientEmail
      const pinCode = getRandomInt(9999)

      await admin
         .firestore()
         .collection("userData")
         .doc(recipientEmail)
         .update({ validationPin: pinCode })

      const email = {
         TemplateId: process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION,
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
   .runWith({
      minInstances: 1,
   })
   .https.onCall(async (data) => {
      const recipientEmail = data.userInfo.recipientEmail
      const pinCode = data.userInfo.pinCode
      let error

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

// eslint-disable-next-line camelcase
export const sendPostmarkResetPasswordEmail_v2 = functions.https.onCall(
   async (data) => {
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
            TemplateId: process.env.POSTMARK_TEMPLATE_PASSWORD_RESET,
            From: "CareerFairy <noreply@careerfairy.io>",
            To: recipientEmail,
            TemplateModel: { action_url: link },
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
   }
)

export const sendPostmarkEmailUserDataAndUni = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

      const recipientEmail = req.body.recipientEmail.toLowercase()
      const recipientFirstName = req.body.firstName
      const recipientLastName = req.body.lastName
      const recipientUniversity = req.body.universityCode
      const recipientUniversityCountryCode = req.body.universityCountryCode
      const pinCode = getRandomInt(9999)

      admin
         .firestore()
         .collection("userData")
         .doc(recipientEmail)
         .set({
            id: recipientEmail,
            validationPin: pinCode,
            firstName: recipientFirstName,
            lastName: recipientLastName,
            userEmail: recipientEmail,
            universityCode: recipientUniversity,
            universityCountryCode: recipientUniversityCountryCode,
         })
         .then(() => {
            const email = {
               TemplateId: process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION,
               From: "CareerFairy <noreply@careerfairy.io>",
               To: recipientEmail,
               TemplateModel: { pinCode: pinCode },
            }

            return client.sendEmailWithTemplate(email).then(
               (response) => {
                  console.log(
                     `Successfully sent PIN email to ${recipientEmail}`
                  )
                  res.sendStatus(200)
               },
               (error) => {
                  console.error(
                     `Error sending PIN email to ${recipientEmail}`,
                     error
                  )
                  res.sendStatus(500)
               }
            )
         })
         .catch((error) => {
            console.error(`Error creating user ${recipientEmail}`, error)
            res.sendStatus(500)
         })
   }
)

export const sendPostmarkEmailUserDataAndUniWithName =
   functions.https.onRequest(async (req, res) => {
      setHeaders(req, res)

      const recipientEmail = req.body.recipientEmail
      const recipientFirstName = req.body.firstName
      const recipientLastName = req.body.lastName
      const recipientUniversity = req.body.universityCode
      const recipientUniversityName = req.body.universityName
      const recipientUniversityCountryCode = req.body.universityCountryCode
      const pinCode = getRandomInt(9999)

      admin
         .firestore()
         .collection("userData")
         .doc(recipientEmail)
         .set({
            id: recipientEmail,
            validationPin: pinCode,
            firstName: recipientFirstName,
            lastName: recipientLastName,
            userEmail: recipientEmail,
            universityCode: recipientUniversity,
            university: {
               name: recipientUniversityName,
               code: recipientUniversity,
            },
            universityName: recipientUniversityName,
            universityCountryCode: recipientUniversityCountryCode,
         })
         .then(() => {
            const email = {
               TemplateId: process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION,
               From: "CareerFairy <noreply@careerfairy.io>",
               To: recipientEmail,
               TemplateModel: { pinCode: pinCode },
            }

            return client.sendEmailWithTemplate(email).then(
               (response) => {
                  console.log(
                     `Successfully sent PIN email to ${recipientEmail}`
                  )
                  res.sendStatus(200)
               },
               (error) => {
                  console.error(
                     `Error sending PIN email to ${recipientEmail}`,
                     error
                  )
                  res.sendStatus(500)
               }
            )
         })
         .catch((error) => {
            console.error(`Error creating user ${recipientEmail}`, error)
            res.sendStatus(500)
         })
   })

export const updateFakeUser = functions.https.onRequest(async (req, res) => {
   setHeaders(req, res)

   admin
      .auth()
      .updateUser(req.body.uid, {
         emailVerified: true,
      })
      .then(function (userRecord) {
         // See the UserRecord reference doc for the contents of userRecord.
         console.log("Successfully updated user", userRecord.toJSON())
      })
      .catch(function (error) {
         console.log("Error updating user:", error)
      })
})

export const backfillUserData = functions.https.onCall(
   async (data, context) => {
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

      const userData = (await userLib.userGetByEmail(email)) as UserData
      const dataToUpdate: Partial<UserData> = {}

      if (!userData.referralCode) {
         dataToUpdate.referralCode = generateReferralCode()
         functions.logger.info("Adding referralCode to user")
      }

      if (Object.keys(dataToUpdate).length > 0) {
         await userLib.userUpdateFields(email, dataToUpdate)
         functions.logger.info(
            "User updated with the following fields",
            dataToUpdate
         )
      }
   }
)

export const onUserUpdate = functions
   .region(config.region)
   .firestore.document("userData/{userDataId}")
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data() as UserData
      const newValue = change.after.data() as UserData

      try {
         await handleUserNetworkerBadges(context.params.userDataId, newValue)
      } catch (e) {
         functions.logger.log(previousValue, newValue)
         functions.logger.error("Failed to update user badges", e)
      }
   })

export const onUserStatsUpdate = functions
   .region(config.region)
   .firestore.document("userData/{userDataId}/stats/stats")
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data() as UserStats
      const newValue = change.after.data() as UserStats

      try {
         await handleUserStatsBadges(context.params.userDataId, newValue)
      } catch (e) {
         functions.logger.log(previousValue, newValue)
         functions.logger.error("Failed to update user badges", e)
      }
   })

export const deleteLoggedInUserAccount = functions.https.onCall(
   async (data, context) => {
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
   }
)

// This function assigns a user an admin claim for a specific group
async function grantGroupAdminRole(email: string, groupId: string) {
   const user = await admin.auth().getUserByEmail(email) // 1
   if (user.customClaims && user.customClaims.groupAdmins.includes(groupId)) {
      return // If the user already has the claim, our work is done here
   }
   return admin.auth().setCustomUserClaims(user.uid, {
      groupAdmins: [...(user.customClaims?.groupAdmins || []), groupId], // Add the group to the list of groups the user is an admin of
   })
}

const sendVerificationEmail = async (args: {
   email: string
   pinCode: number
   uid: string
}) => {
   console.log(`Starting sending email for ${args.email}`)
   const emailTemplate = {
      TemplateId: process.env.POSTMARK_TEMPLATE_EMAIL_VERIFICATION,
      From: "CareerFairy <noreply@careerfairy.io>",
      To: args.email,
      TemplateModel: { pinCode: args.pinCode },
   }
   const response = await client.sendEmailWithTemplate(emailTemplate)
   console.log(`Sent email successfully for ${args.email}`)

   return response
}
