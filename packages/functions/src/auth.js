const functions = require("firebase-functions")
const { client } = require("./api/postmark")
const { admin } = require("./api/firestoreAdmin")

const { setHeaders, generateReferralCode } = require("./util")
const {
   userGetByReferralCode,
   userGetByEmail,
   userUpdateFields,
} = require("./lib/user")
const { rewardCreateReferralSignUpFollower } = require("./lib/reward")
const config = require("./config")
const { handleUserBadges } = require("./lib/badge")

const getRandomInt = (max) => {
   let variable = Math.floor(Math.random() * Math.floor(max))
   if (variable < 1000) {
      return variable + 1000
   } else {
      return variable
   }
}

exports.createNewUserAccount_v2 = functions.https.onCall(
   async (data, context) => {
      if (context.auth) {
         // Throwing an HttpsError so that the client gets the error details.
         throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while logged out."
         )
      }

      const userData = data.userData
      const recipient_email = data.userData.email.toLowerCase()
      const pinCode = getRandomInt(9999)

      console.log(
         `Starting auth account creation process for ${recipient_email}`
      )
      await admin
         .auth()
         .createUser({ email: userData.email, password: userData.password })
         .then(async (user) => {
            console.log(
               `Starting firestore account creation process for ${recipient_email}`
            )

            // Check if the user was referred by someone
            const referralData = {}
            let referralUser = null
            if (userData.referralCode) {
               referralUser = await userGetByReferralCode(userData.referralCode)

               if (referralUser) {
                  referralData.referredBy = {
                     uid: referralUser.id,
                     name: `${referralUser.firstName} ${referralUser.lastName}`,
                  }
                  functions.logger.info(
                     `Adding referral information to the new user.`
                  )
               } else {
                  functions.logger.warn(
                     `Invalid referral code: ${userData.referralCode}, no corresponding user.`
                  )
               }
            }

            await admin
               .firestore()
               .collection("userData")
               .doc(recipient_email)
               .set(
                  Object.assign(
                     {
                        authId: user.uid,
                        id: recipient_email,
                        validationPin: pinCode,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        userEmail: recipient_email,
                        university: userData.university,
                        universityCountryCode: userData.universityCountryCode,
                        unsubscribed: !userData.subscribed,
                        referralCode: generateReferralCode(),
                     },
                     referralData
                  )
               )
               .then(async () => {
                  console.log(`Starting sending email for ${recipient_email}`)
                  const email = {
                     TemplateId: 17669843,
                     From: "CareerFairy <noreply@careerfairy.io>",
                     To: recipient_email,
                     TemplateModel: { pinCode: pinCode },
                  }
                  try {
                     let response = await client.sendEmailWithTemplate(email)
                     console.log(
                        `Sent email successfully for ${recipient_email}`
                     )

                     // Create the referral follower reward if the user was referred by someone
                     if (referralData.referredBy) {
                        try {
                           await rewardCreateReferralSignUpFollower(
                              recipient_email,
                              referralUser
                           )
                           functions.logger.info(
                              "Created referral follower reward for this user."
                           )
                        } catch (e) {
                           // We don't want to fail the registration just because the reward failed
                           functions.logger.error(e)
                        }
                     }

                     return response
                  } catch (error) {
                     console.error(
                        `Error sending PIN email to ${recipient_email}`,
                        error
                     )
                     console.error(
                        `Starting auth and firestore user deletion ${recipient_email}`,
                        error
                     )
                     await admin.auth().deleteUser(user.uid)
                     await admin
                        .firestore()
                        .collection("userData")
                        .doc(recipient_email)
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
                        `Starting auth user deletion ${recipient_email}`,
                        error
                     )
                     await admin.auth().deleteUser(user.uid)
                  }
                  console.error(
                     `Error creating user ${recipient_email} in firestore`,
                     error
                  )
                  throw new functions.https.HttpsError("internal", error)
               })
         })
         .catch(async (error) => {
            console.error(
               `Error creating user ${recipient_email} in firebase auth`,
               error
            )
            throw new functions.https.HttpsError("internal", error)
         })
   }
)

exports.resendPostmarkEmailVerificationEmailWithPin = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

      const recipient_email = req.body.recipientEmail
      const pinCode = getRandomInt(9999)

      await admin
         .firestore()
         .collection("userData")
         .doc(recipient_email)
         .update({ validationPin: pinCode })

      const email = {
         TemplateId: 17669843,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: recipient_email,
         TemplateModel: { pinCode: pinCode },
      }

      return client.sendEmailWithTemplate(email).then(
         (response) => {
            res.sendStatus(200)
         },
         (error) => {
            res.sendStatus(500)
         }
      )
   }
)

exports.validateUserEmailWithPin = functions
   .runWith({
      minInstances: 1,
   })
   .https.onCall(async (data, context) => {
      const recipient_email = data.userInfo.recipientEmail
      const pinCode = data.userInfo.pinCode

      functions.logger.log(
         `Starting user email validation for ${recipient_email}`
      )

      try {
         let querySnapshot = await admin
            .firestore()
            .collection("userData")
            .doc(recipient_email)
            .get()
         if (querySnapshot.exists) {
            let user = querySnapshot.data()
            functions.logger.log(`Acquired user data for ${recipient_email}`)
            if (user.validationPin === pinCode) {
               functions.logger.log(
                  `Provided Pin code for ${recipient_email} is correct`
               )
               const userRecord = await admin
                  .auth()
                  .getUserByEmail(recipient_email)

               const updatedUserRecord = await admin
                  .auth()
                  .updateUser(userRecord.uid, {
                     emailVerified: true,
                  })

               functions.logger.log(
                  `Auth user ${recipient_email} has been validated`
               )

               functions.logger.log(`Updated User Record`, updatedUserRecord)

               return updatedUserRecord
            } else {
               functions.logger.warn(
                  `User ${recipient_email} has failed to provide the correct Pin code, provided ${pinCode} instead of ${user.validationPin}`
               )
            }
         }
      } catch (error) {
         functions.logger.warn(
            `An error has occurred fetching userData for ${recipient_email}`
         )
         throw new functions.https.HttpsError("unknown", "")
      }
   })

exports.sendPostmarkResetPasswordEmail = functions.https.onRequest(
   async (req, res) => {
      res.set("Access-Control-Allow-Origin", "*")
      res.set("Access-Control-Allow-Credentials", "true")

      if (req.method === "OPTIONS") {
         // Send response to OPTIONS requests
         res.set("Access-Control-Allow-Methods", "GET")
         res.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
         res.set("Access-Control-Max-Age", "3600")
         return res.sendStatus(204)
      }

      const recipient_email = req.body.recipientEmail
      const redirect_link = req.body.redirect_link

      const actionCodeSettings = {
         url: redirect_link,
      }

      console.log("recipient_email", recipient_email)

      admin
         .auth()
         .generatePasswordResetLink(
            recipient_email.toLowerCase(),
            actionCodeSettings
         )
         .then((link) => {
            const email = {
               TemplateId: 16531013,
               From: "CareerFairy <noreply@careerfairy.io>",
               To: recipient_email,
               TemplateModel: { action_url: link },
            }
            return client.sendEmailWithTemplate(email).then(
               (response) => {
                  res.sendStatus(200)
               },
               (error) => {
                  res.send("Error: " + error)
               }
            )
         })
         .catch((error) => {
            console.log(error)
         })
   }
)

exports.sendPostmarkEmailUserDataAndUni = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

      const recipient_email = req.body.recipientEmail.toLowercase()
      const recipient_first_name = req.body.firstName
      const recipient_last_name = req.body.lastName
      const recipient_university = req.body.universityCode
      const recipient_university_country_code = req.body.universityCountryCode
      const pinCode = getRandomInt(9999)

      admin
         .firestore()
         .collection("userData")
         .doc(recipient_email)
         .set({
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            universityCode: recipient_university,
            universityCountryCode: recipient_university_country_code,
         })
         .then(() => {
            const email = {
               TemplateId: 17669843,
               From: "CareerFairy <noreply@careerfairy.io>",
               To: recipient_email,
               TemplateModel: { pinCode: pinCode },
            }

            return client.sendEmailWithTemplate(email).then(
               (response) => {
                  console.log(
                     `Successfully sent PIN email to ${recipient_email}`
                  )
                  res.sendStatus(200)
               },
               (error) => {
                  console.error(
                     `Error sending PIN email to ${recipient_email}`,
                     error
                  )
                  res.sendStatus(500)
               }
            )
         })
         .catch((error) => {
            console.error(`Error creating user ${recipient_email}`, error)
            res.sendStatus(500)
         })
   }
)

exports.sendPostmarkEmailUserDataAndUniWithName = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

      const recipient_email = req.body.recipientEmail
      const recipient_first_name = req.body.firstName
      const recipient_last_name = req.body.lastName
      const recipient_university = req.body.universityCode
      const recipient_university_name = req.body.universityName
      const recipient_university_country_code = req.body.universityCountryCode
      const pinCode = getRandomInt(9999)

      admin
         .firestore()
         .collection("userData")
         .doc(recipient_email)
         .set({
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            universityCode: recipient_university,
            university: {
               name: recipient_university_name,
               code: recipient_university,
            },
            universityName: recipient_university_name,
            universityCountryCode: recipient_university_country_code,
         })
         .then(() => {
            const email = {
               TemplateId: 17669843,
               From: "CareerFairy <noreply@careerfairy.io>",
               To: recipient_email,
               TemplateModel: { pinCode: pinCode },
            }

            return client.sendEmailWithTemplate(email).then(
               (response) => {
                  console.log(
                     `Successfully sent PIN email to ${recipient_email}`
                  )
                  res.sendStatus(200)
               },
               (error) => {
                  console.error(
                     `Error sending PIN email to ${recipient_email}`,
                     error
                  )
                  res.sendStatus(500)
               }
            )
         })
         .catch((error) => {
            console.error(`Error creating user ${recipient_email}`, error)
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
         `The user calling the function is not authenticated`
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
         await handleUserBadges(
            context.params.userDataId,
            previousValue,
            newValue
         )
      } catch (e) {
         functions.logger.log(previousValue, newValue)
         functions.logger.error("Failed to update user badges", e)
      }
   })
