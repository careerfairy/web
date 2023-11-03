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
   createLiveStreamStatsDoc,
   LiveStreamStats,
   LivestreamStatsMap,
   LivestreamStatsMapKey,
} from "@careerfairy/shared-lib/dist/livestreams/stats"
import { DeepPartial } from "@careerfairy/shared-lib/dist/utils/types"
import { logAction } from "../../../util/logger"
import { merge } from "lodash"

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

let currentLivestreamStatsDict: Record<string, LiveStreamStats>

export async function run() {
   try {
      const [livestreams, userLivestreamData, currentLivestreamStats] =
         await logAction(
            () =>
               Promise.all([
                  livestreamRepo.getAllLivestreams(false, true),
                  livestreamRepo.getAllUserLivestreamData(true),
                  livestreamRepo.getAllLivestreamStats(true),
               ]),
            "Fetching all livestreams, livestream stats and user livestream data"
         )

      Counter.log(
         `Fetched ${livestreams.length} livestreams, ${currentLivestreamStats.length} livestream stats and ${userLivestreamData.length} user livestream data`
      )

      counter.addToReadCount(
         livestreams.length +
            userLivestreamData.length +
            currentLivestreamStats.length
      )

      livestreamsDict = convertDocArrayToDict(livestreams)

      // add the livestream stats to the dictionary
      currentLivestreamStatsDict = currentLivestreamStats.reduce(
         (acc, stat) => {
            const livestreamId = stat._ref.parent.parent.id
            delete stat._ref // we don't need the ref anymore
            acc[livestreamId] = stat as LiveStreamStats
            return acc
         },
         {}
      )

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
   for (const user of users) {
      const { participated, registered, talentPool, jobApplications, _ref } =
         user
      const isParticipant = Boolean(participated?.date)
      const isRegistered = Boolean(registered?.date)
      const isInTalentPool = Boolean(talentPool?.date)
      const numberOfApplications = Object.keys(jobApplications || {}).length
      const livestreamId = _ref?.parent?.parent?.id

      const livestream = livestreamsDict[livestreamId]
      if (!livestreamId || !livestream) {
         continue
      }

      if (!statsToUpdateDict[livestreamId]) {
         statsToUpdateDict[livestreamId] = createEmptyStats(livestream)
      }

      // Increment general stats
      const { generalStats } = statsToUpdateDict[livestreamId]
      generalStats.numberOfParticipants += Number(isParticipant)
      generalStats.numberOfRegistrations += Number(isRegistered)
      generalStats.numberOfTalentPoolProfiles += Number(isInTalentPool)
      generalStats.numberOfApplicants += numberOfApplications

      statsDictionaries.forEach(({ key, getStatId }) => {
         const statId = getStatId(user)

         if (!statId) {
            return
         }

         if (!statsToUpdateDict[livestreamId][key][statId]) {
            statsToUpdateDict[livestreamId][key][statId] = createEmptyStatsMap()
         }

         // Increment stats for each dictionary
         const stats = statsToUpdateDict[livestreamId][key][statId]

         stats.numberOfParticipants += Number(isParticipant)
         stats.numberOfRegistrations += Number(isRegistered)
         stats.numberOfTalentPoolProfiles += Number(isInTalentPool)
         stats.numberOfApplicants += numberOfApplications
      })
   }
}

const handleSaveLivestreamStatsInFirestore = async () => {
   let batchSize = 180 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = Object.entries(statsToUpdateDict)
   const totalNumDocs = totalDocs.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const statsData = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      statsData.forEach(([eventId, stats]) => {
         writeProgressBar.increment() // Increment progress bar

         const livestream = livestreamsDict[eventId]

         if (!livestream) {
            Counter.log(`Livestream with id ${eventId} not found, skipping...`)
            return
         }

         const livestreamRef = firestore.collection("livestreams").doc(eventId) // Get livestream ref

         const statsRef = livestreamRef.collection("stats").doc(stats.id) // Get stats ref from livestream ref

         const currentStats = currentLivestreamStatsDict[eventId]

         if (currentStats) {
            // If there are already stats, merge them with the new stats, so we don't overwrite the stats that are already set
            const mergedStats = merge(currentStats, stats)

            // update here since set(arg, {merge: true})  fails and we want to merge the stats not overwrite them
            batch.update(statsRef, mergedStats as { [x: string]: any })
         } else {
            const newStats = createLiveStreamStatsDoc(
               livestream,
               "liveStreamStats"
            )

            const mergedStats = merge(newStats, stats)

            batch.set(statsRef, mergedStats)
         }

         counter.writeIncrement() // Increment write counter
      })

      await batch.commit()
   }

   writeProgressBar.stop()
   Counter.log("All batches committed! :)")
}

const createEmptyStatsMap = (): Pick<
   LivestreamStatsMap,
   | "numberOfRegistrations"
   | "numberOfParticipants"
   | "numberOfApplicants"
   | "numberOfTalentPoolProfiles"
> => {
   return {
      numberOfParticipants: 0,
      numberOfRegistrations: 0,
      numberOfTalentPoolProfiles: 0,
      numberOfApplicants: 0,
   }
}

const createEmptyStats = (
   livestream: LivestreamEvent
): LivestreamStatsToUpdate => {
   return {
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
      countryStats: {},
      fieldOfStudyStats: {},
      livestream: pickPublicDataFromLivestream(livestream),
   }
}

type DictVariable = {
   key: LivestreamStatsMapKey
   getStatId: (data: UserLivestreamDataWithRef) => string | undefined
}

const statsDictionaries: DictVariable[] = [
   {
      key: "countryStats",
      getStatId: (data) => data.user?.universityCountryCode,
   },
   {
      key: "universityStats",
      getStatId: (data) => data.user?.university?.code,
   },
   {
      key: "fieldOfStudyStats",
      getStatId: (data) => data.user?.fieldOfStudy?.id,
   },
]
