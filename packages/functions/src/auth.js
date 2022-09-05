const functions = require("firebase-functions")
const { client } = require("./api/postmark")
const { admin } = require("./api/firestoreAdmin")

const { setHeaders, generateReferralCode } = require("./util")
const { userGetByEmail, userUpdateFields } = require("./lib/user")
const config = require("./config")
const {
   handleUserNetworkerBadges,
   handleUserStatsBadges,
} = require("./lib/badge")
const { marketingUsersRepo } = require("./api/repositories")

const getRandomInt = (max) => {
   const variable = Math.floor(Math.random() * Math.floor(max))
   if (variable < 1000) {
      return variable + 1000
   } else {
      return variable
   }
}

exports.createNewUserAccount_v4 = functions.https.onCall(
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

exports.resendPostmarkEmailVerificationEmailWithPin_v2 = functions.https.onCall(
   async (data) => {
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
   }
)

exports.validateUserEmailWithPin = functions
   .runWith({
      minInstances: 1,
   })
   .https.onCall(async (data, context) => {
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
               functions.logger.error(
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
   })

exports.sendPostmarkResetPasswordEmail_v2 = functions.https.onCall(
   async (data) => {
      let emailInError
      try {
         emailInError = data.recipientEmail
         const recipientEmail = data.recipientEmail
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
            `Error in sending password reset link with email ${emailInError}`,
            e
         )
         // The client should not know if this request was successful or not, so we just log it on the server
      }
   }
)

exports.sendPostmarkEmailUserDataAndUni = functions.https.onRequest(
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

exports.sendPostmarkEmailUserDataAndUniWithName = functions.https.onRequest(
   async (req, res) => {
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
   }
)

exports.updateFakeUser = functions.https.onRequest(async (req, res) => {
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

exports.backfillUserData = functions.https.onCall(async (data, context) => {
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

   const userData = await userGetByEmail(email)
   const dataToUpdate = {}

   if (!userData.referralCode) {
      dataToUpdate.referralCode = generateReferralCode()
      functions.logger.info("Adding referralCode to user")
   }

   if (Object.keys(dataToUpdate).length > 0) {
      await userUpdateFields(email, dataToUpdate)
      functions.logger.info(
         "User updated with the following fields",
         dataToUpdate
      )
   }
})

exports.onUserUpdate = functions
   .region(config.region)
   .firestore.document("userData/{userDataId}")
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data()
      const newValue = change.after.data()

      try {
         await handleUserNetworkerBadges(context.params.userDataId, newValue)
      } catch (e) {
         functions.logger.log(previousValue, newValue)
         functions.logger.error("Failed to update user badges", e)
      }
   })

exports.onUserStatsUpdate = functions
   .region(config.region)
   .firestore.document("userData/{userDataId}/stats/stats")
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data()
      const newValue = change.after.data()

      try {
         await handleUserStatsBadges(context.params.userDataId, newValue)
      } catch (e) {
         functions.logger.log(previousValue, newValue)
         functions.logger.error("Failed to update user badges", e)
      }
   })

exports.deleteLoggedInUserAccount = functions.https.onCall(
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
