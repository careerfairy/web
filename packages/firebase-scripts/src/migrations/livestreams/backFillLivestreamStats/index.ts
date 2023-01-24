import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { DataWithRef } from "../../../util/types"
import {
   LiveStreamStats,
   LivestreamStatsMap,
} from "@careerfairy/shared-lib/dist/livestreams/stats"
import { DeepPartial } from "@careerfairy/shared-lib/dist/utils/types"

const counter = new Counter()

// types
type LivestreamWithRef = DataWithRef<true, LivestreamEvent>
type UserLivestreamDataWithRef = DataWithRef<true, UserLivestreamData>
type LivestreamStatsToUpdate = DeepPartial<LiveStreamStats>

// cached globally
let livestreamsDict: Record<string, LivestreamWithRef>
let statsToUpdateDict: Record<
   // livestreamId
   string,
   // the livestream stats we would like to update, we don't want to overwrite the stats that are not set by this script.
   // This will allow us to run this script multiple times without overwriting the stats that are already set
   LivestreamStatsToUpdate
> = {}

export async function run() {
   try {
      Counter.log("Fetching all livestreams and user livestream data")

      const [livestreams, userLivestreamData] = await Promise.all([
         livestreamRepo.getAllLivestreams(false, true),
         livestreamRepo.getAllUserLivestreamData(true),
      ])

      Counter.log(
         `Fetched ${livestreams.length} livestreams and ${userLivestreamData.length} user livestream data`
      )

      counter.addToReadCount(livestreams.length + userLivestreamData.length)

      livestreamsDict = convertDocArrayToDict(livestreams)

      addUserStatsToDictionary(userLivestreamData)

      await handleSaveLivestreamStatsInFirestore()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const addUserStatsToDictionary = (users: UserLivestreamDataWithRef[]) => {
   users.forEach((user) => {
      const isParticipant = Boolean(user?.participated?.date)
      const isRegistered = Boolean(user?.registered?.date)
      const isInTalentPool = Boolean(user?.talentPool?.date)
      const numberOfApplications = Object.keys(
         user?.jobApplications || {}
      ).length
      const livestreamId = user._ref.parent?.parent?.id

      const userUniversityCode = user.user?.university?.code

      const livestream = livestreamsDict[livestreamId]

      if (!livestreamId || !livestream) {
         return
      }

      if (!statsToUpdateDict[livestreamId]) {
         // If stats doc doesn't exist, create it

         statsToUpdateDict[livestreamId] = {
            // We create a partial object to update the stats, so we don't overwrite the stats that are not set by this script
            generalStats: {
               numberOfParticipants: 0,
               numberOfRegistrations: 0,
               numberOfTalentPoolProfiles: 0,
               numberOfApplicants: 0,
               // numberOfPeopleReached - we don't want to overwrite this value as it is not set by this script
            },
            id: "livestreamStats",
            universityStats: {},
            livestream: pickPublicDataFromLivestream(livestream),
         }
      }

      // Increment general stats
      if (isParticipant) {
         statsToUpdateDict[livestreamId].generalStats.numberOfParticipants++
      }
      if (isRegistered) {
         statsToUpdateDict[livestreamId].generalStats.numberOfRegistrations++
      }
      if (isInTalentPool) {
         statsToUpdateDict[livestreamId].generalStats
            .numberOfTalentPoolProfiles++
      }
      if (numberOfApplications) {
         statsToUpdateDict[livestreamId].generalStats.numberOfApplicants +=
            numberOfApplications
      }

      if (userUniversityCode) {
         // If user has university code, increment university stats

         if (
            !statsToUpdateDict[livestreamId].universityStats[userUniversityCode]
         ) {
            // If university stats don't exist, create it
            statsToUpdateDict[livestreamId].universityStats[
               userUniversityCode
            ] = createEmptyUniversityStats()
         }

         // Increment university stats
         if (isParticipant) {
            statsToUpdateDict[livestreamId].universityStats[userUniversityCode]
               .numberOfParticipants++
         }
         if (isRegistered) {
            statsToUpdateDict[livestreamId].universityStats[userUniversityCode]
               .numberOfRegistrations++
         }
         if (isInTalentPool) {
            statsToUpdateDict[livestreamId].universityStats[userUniversityCode]
               .numberOfTalentPoolProfiles++
         }
         if (numberOfApplications) {
            statsToUpdateDict[livestreamId].universityStats[
               userUniversityCode
            ].numberOfApplicants += numberOfApplications
         }
      }
   })
}

const handleSaveLivestreamStatsInFirestore = async () => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = Object.entries(statsToUpdateDict)
   const totalNumDocs = totalDocs.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const statsData = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      statsData.forEach(([eventId, stats]) => {
         writeProgressBar.increment() // Increment progress bar

         const livestreamRef = livestreamsDict[eventId]
            ._ref as unknown as FirebaseFirestore.DocumentReference // Get livestream ref from livestreamsDict

         const statsRef = livestreamRef.collection("stats").doc(stats.id) // Get stats ref from livestream ref

         batch.set(statsRef, stats, { merge: true }) // Upsert the stats data

         counter.writeIncrement() // Increment write counter
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All batches committed! :)")
}

const createEmptyUniversityStats = (): LivestreamStatsMap => {
   return {
      numberOfParticipants: 0,
      numberOfRegistrations: 0,
      numberOfTalentPoolProfiles: 0,
      numberOfApplicants: 0,
      numberOfPeopleReached: 0,
   }
}
