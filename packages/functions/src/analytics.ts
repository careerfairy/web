import functions = require("firebase-functions")
import { FieldValue, firestore } from "./api/firestoreAdmin"
import config from "./config"

export const updateUserDataAnalyticsOnWrite = functions
   .region(config.region)
   .firestore.document("userData/{userId}")
   .onWrite(async (change) => {
      const newValue = change.after.data()
      const previousValue = change.before.data()
      const oldUniCountryCode =
         (previousValue && previousValue.universityCountryCode) || null
      const newUniCountryCode =
         (newValue && newValue.universityCountryCode) || null
      functions.logger.log("oldUniCountryCode:", oldUniCountryCode)
      functions.logger.log("newUniCountryCode:", newUniCountryCode)
      try {
         const universityCountryCodeHasChanged =
            newUniCountryCode !== oldUniCountryCode
         if (universityCountryCodeHasChanged) {
            let newData = {}

            const analyticsUserDataRef = firestore
               .collection("analytics")
               .doc("userData")
            if (oldUniCountryCode) {
               // Decrement previous university country count in db
               newData = {
                  ...newData,
                  [`totalByCountry.${oldUniCountryCode}`]:
                     FieldValue.increment(-1),
               }
            }
            if (newUniCountryCode) {
               // Increment new university country in db
               newData = {
                  ...newData,
                  [`totalByCountry.${newUniCountryCode}`]:
                     FieldValue.increment(1),
               }
            }

            if (!oldUniCountryCode && newUniCountryCode) {
               // Increment total field if you previously didn't have any university country
               newData = {
                  ...newData,
                  total: FieldValue.increment(1),
               }
            } else if (oldUniCountryCode && !newUniCountryCode) {
               // Decrement total field if you previously did have a university country but now you dont
               newData = {
                  ...newData,
                  total: FieldValue.increment(-1),
               }
            }
            await analyticsUserDataRef.update(newData)
            functions.logger.info(
               `successfully updated userData country analytics, OLD:${oldUniCountryCode}, NEW:${newUniCountryCode}`
            )
         }
      } catch (error) {
         functions.logger.error(
            "failed to update userData analytics with error:",
            error
         )
      }
   })
