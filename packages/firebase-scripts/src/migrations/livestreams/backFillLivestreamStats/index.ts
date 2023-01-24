import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { DataWithRef } from "../../../util/types"
import {
   createLiveStreamStatsDoc,
   LiveStreamStats,
   LivestreamStatsMap,
} from "@careerfairy/shared-lib/dist/livestreams/stats"

const counter = new Counter()
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

      const livestreamsDict = convertDocArrayToDict(livestreams)

      const stats = createStatsDictionary(userLivestreamData, livestreamsDict)

      await handleSaveLivestreamStatsInFirestore(stats, livestreamsDict)

      Counter.log("All batches committed! :)")
      /*
       * Commits all enqueued writes and marks the BulkWriter instance as closed.
       * After calling close(), calling any method will throw an error.
       * Any retries scheduled as part of an onWriteError() handler will
       * be run before the close() promise resolves.
       * */
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const createStatsDictionary = (
   users: UserLivestreamDataWithRef[],
   livestreamsDict: Record<string, LivestreamWithRef>
): Record<string, LiveStreamStats> => {
   const statsDict: Record<
      string, // livestreamId
      LiveStreamStats
   > = {}

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

      if (!statsDict[livestreamId]) {
         // If stats doc doesn't exist, create it
         statsDict[livestreamId] = createLiveStreamStatsDoc(
            livestream,
            "livestreamStats"
         )
      }

      // Increment general stats
      if (isParticipant) {
         statsDict[livestreamId].generalStats.numberOfParticipants++
      }
      if (isRegistered) {
         statsDict[livestreamId].generalStats.numberOfRegistrations++
      }
      if (isInTalentPool) {
         statsDict[livestreamId].generalStats.numberOfTalentPoolProfiles++
      }
      if (numberOfApplications) {
         statsDict[livestreamId].generalStats.numberOfApplicants +=
            numberOfApplications
      }

      if (userUniversityCode) {
         // If user has university code, increment university stats

         if (!statsDict[livestreamId].universityStats[userUniversityCode]) {
            // If university stats don't exist, create it
            statsDict[livestreamId].universityStats[userUniversityCode] =
               createEmptyUniversityStats()
         }

         // Increment university stats
         if (isParticipant) {
            statsDict[livestreamId].universityStats[userUniversityCode]
               .numberOfParticipants++
         }
         if (isRegistered) {
            statsDict[livestreamId].universityStats[userUniversityCode]
               .numberOfRegistrations++
         }
         if (isInTalentPool) {
            statsDict[livestreamId].universityStats[userUniversityCode]
               .numberOfTalentPoolProfiles++
         }
         if (numberOfApplications) {
            statsDict[livestreamId].universityStats[
               userUniversityCode
            ].numberOfApplicants += numberOfApplications
         }
      }
   })

   return statsDict
}

const handleSaveLivestreamStatsInFirestore = async (
   stats: Record<string, LiveStreamStats>,
   livestreamsDict: Record<string, LivestreamWithRef>
) => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = Object.entries(stats)
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

   Counter.log("Started committing all batches...")
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

type LivestreamWithRef = DataWithRef<true, LivestreamEvent>
type UserLivestreamDataWithRef = DataWithRef<true, UserLivestreamData>
