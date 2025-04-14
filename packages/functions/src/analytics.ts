import { logger } from "firebase-functions/v2"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { FieldValue, firestore } from "./api/firestoreAdmin"

export const updateUserDataAnalyticsOnWrite = onDocumentWritten(
   "userData/{userId}",
   async (change) => {
      const newValue = change.data?.after.data()
      const previousValue = change.data?.before.data()
      const oldUniCountryCode =
         (previousValue && previousValue.universityCountryCode) || null
      const newUniCountryCode =
         (newValue && newValue.universityCountryCode) || null
      logger.log("oldUniCountryCode:", oldUniCountryCode)
      logger.log("newUniCountryCode:", newUniCountryCode)
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
            logger.info(
               `successfully updated userData country analytics, OLD:${oldUniCountryCode}, NEW:${newUniCountryCode}`
            )
         }
      } catch (error) {
         logger.error("failed to update userData analytics with error:", error)
      }
   }
)
