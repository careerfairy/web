import functions = require("firebase-functions")
import {
   createLiveStreamStatsDoc,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { admin } from "./api/firestoreAdmin"
import { isEmpty } from "lodash"

export const updateLiveStreamStats = functions.firestore
   .document("livestreams/{livestreamId}/userLivestreamData/{userId}")
   .onWrite(async (change, context) => {
      const { livestreamId } = context.params

      const oldUserLivestreamData = change.before.data() as UserLivestreamData
      const newUserLivestreamData = change.after.data() as UserLivestreamData

      const statsRef = admin
         .firestore()
         .collection("livestreams")
         .doc(livestreamId)
         .collection("stats")
         .doc("liveStreamStats")

      const liveStreamStatsToUpdate: {
         [key: string]: admin.firestore.FieldValue
      } = {}

      handleUpdate(
         newUserLivestreamData,
         oldUserLivestreamData,
         liveStreamStatsToUpdate
      )

      const newUniversityCode = newUserLivestreamData?.user?.university?.code
      const oldUniversityCode = oldUserLivestreamData?.user?.university?.code

      const universityChanged = newUniversityCode !== oldUniversityCode

      if (universityChanged) {
         if (oldUniversityCode) {
            // Decrement all the truthy fields of the oldUserLivestreamData
            decrementOldUniversityData(
               oldUniversityCode,
               oldUserLivestreamData,
               liveStreamStatsToUpdate
            )
         }

         if (newUniversityCode) {
            // Increment all the truthy fields of newUserLivestreamData like participated.date, registered.date, talentPool.date, etc...
            incrementNewUniversityData(
               newUniversityCode,
               newUserLivestreamData,
               liveStreamStatsToUpdate
            )
         }
      } else {
         handleUpdate(
            newUserLivestreamData,
            oldUserLivestreamData,
            liveStreamStatsToUpdate,
            newUniversityCode
         )
      }

      if (isEmpty(liveStreamStatsToUpdate)) {
         functions.logger.info("No changes to livestream stats", {
            livestreamId,
            liveStreamStatsToUpdate,
         })
      } else {
         await admin.firestore().runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(statsRef)
            if (!statsDoc.exists) {
               // Create the stats document
               const statsDoc = createLiveStreamStatsDoc(
                  livestreamId,
                  statsRef.id
               )
               transaction.set(statsRef, statsDoc)
            }

            transaction.update(statsRef, liveStreamStatsToUpdate)
         })

         functions.logger.info("Updated livestream stats", {
            livestreamId,
            liveStreamStatsToUpdate,
         })
      }

      return
   })

const handleUpdate = (
   newData: UserLivestreamData,
   oldData: UserLivestreamData,
   statsToUpdate: StatsToUpdate,
   universityCode?: string
) => {
   handleUpdateByBooleanCheck(
      Boolean(newData?.participated?.date),
      Boolean(oldData?.participated?.date),
      statsToUpdate,
      "numberOfParticipants",
      universityCode
   )

   handleUpdateByBooleanCheck(
      Boolean(newData?.registered?.date),
      Boolean(oldData?.registered?.date),
      statsToUpdate,
      "numberOfRegistrations",
      universityCode
   )

   handleUpdateByBooleanCheck(
      Boolean(newData?.talentPool?.date),
      Boolean(newData?.talentPool?.date),
      statsToUpdate,
      "numberOfTalentPoolProfiles",
      universityCode
   )

   handleUpdateByNumberCheck(
      Object.keys(newData?.jobApplications || {}).length,
      Object.keys(oldData?.jobApplications || {}).length,
      statsToUpdate,
      "numberOfApplicants",
      universityCode
   )
}

const decrementOldUniversityData = (
   oldUniversityCode: string,
   oldUserLivestreamData: UserLivestreamData,
   liveStreamStatsToUpdate: StatsToUpdate
) => {
   handleUpdateByBooleanCheck(
      false,
      Boolean(oldUserLivestreamData?.participated?.date),
      liveStreamStatsToUpdate,
      "numberOfParticipants",
      oldUniversityCode
   )
   handleUpdateByBooleanCheck(
      false,
      Boolean(oldUserLivestreamData?.registered?.date),
      liveStreamStatsToUpdate,
      "numberOfRegistrations",
      oldUniversityCode
   )
   handleUpdateByBooleanCheck(
      false,
      Boolean(oldUserLivestreamData?.talentPool?.date),
      liveStreamStatsToUpdate,
      "numberOfTalentPoolProfiles",
      oldUniversityCode
   )
   handleUpdateByNumberCheck(
      0,
      Object.keys(oldUserLivestreamData?.jobApplications || {}).length,
      liveStreamStatsToUpdate,
      "numberOfApplicants"
   )
}

const incrementNewUniversityData = (
   newUniversityCode: string,
   newUserLivestreamData: UserLivestreamData,
   liveStreamStatsToUpdate: StatsToUpdate
) => {
   handleUpdateByBooleanCheck(
      Boolean(newUserLivestreamData?.participated?.date),
      false,
      liveStreamStatsToUpdate,
      "numberOfParticipants",
      newUniversityCode
   )
   handleUpdateByBooleanCheck(
      Boolean(newUserLivestreamData?.registered?.date),
      false,
      liveStreamStatsToUpdate,
      "numberOfRegistrations",
      newUniversityCode
   )
   handleUpdateByBooleanCheck(
      Boolean(newUserLivestreamData?.talentPool?.date),
      false,
      liveStreamStatsToUpdate,
      "numberOfTalentPoolProfiles",
      newUniversityCode
   )
   handleUpdateByNumberCheck(
      Object.keys(newUserLivestreamData?.jobApplications || {}).length,
      0,
      liveStreamStatsToUpdate,
      "numberOfApplicants"
   )
}

type StatsToUpdate = {
   [key: string]: admin.firestore.FieldValue
}

const handleUpdateByBooleanCheck = <IStats>(
   newBool: boolean,
   oldBool: boolean,
   statsToUpdate: StatsToUpdate,
   field: Extract<keyof IStats, string>,
   universityCode?: string
) => {
   if (newBool !== oldBool) {
      const propertyToUpdate = getPropertyToUpdate(field, universityCode)
      if (newBool) {
         statsToUpdate[propertyToUpdate] = increment()
      } else {
         statsToUpdate[propertyToUpdate] = decrement()
      }
   }
}

const getPropertyToUpdate = (field: string, universityCode?: string) =>
   universityCode
      ? `universityStats.${universityCode}.${String(field)}`
      : `generalStats.${String(field)}`

const handleUpdateByNumberCheck = <IStats extends object>(
   newNumber: number,
   oldNumber: number,
   statsToUpdate: object,
   field: Extract<keyof IStats, string>,
   universityCode?: string
) => {
   if (newNumber !== oldNumber) {
      const propertyToUpdate = getPropertyToUpdate(field, universityCode)

      if (newNumber > oldNumber) {
         statsToUpdate[propertyToUpdate] = increment(newNumber - oldNumber)
      } else {
         statsToUpdate[propertyToUpdate] = decrement(oldNumber - newNumber)
      }
   }
}

const increment = (amount = 1) => admin.firestore.FieldValue.increment(amount)
const decrement = (amount = 1) => admin.firestore.FieldValue.increment(-amount)
