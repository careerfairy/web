import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { DataWithRef } from "../../../util/types"
import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import { DeepPartial } from "@careerfairy/shared-lib/dist/utils/types"
import { logAction } from "../../../util/logger"
import {
   createGroupStatsDoc,
   GroupStats,
} from "@careerfairy/shared-lib/dist/groups/stats"
import { merge } from "lodash"

const counter = new Counter()

// types
type LivestreamStatsWithRef = DataWithRef<true, LiveStreamStats>
type GroupStatsToUpdate = DeepPartial<GroupStats>

// cached globally
let statsToUpdateDict: Record<
   // livestreamId
   string,
   // the livestream stats we would like to update, we don't want to overwrite the stats that are not set by this script.
   // This will allow us to run this script multiple times without overwriting the stats that are already set
   GroupStatsToUpdate
> = {}
const groupStatsId = "groupStats"
export async function run() {
   try {
      Counter.log("Fetching all livestream stats")

      const stats = await logAction(
         () => livestreamRepo.getAllLivestreamStats(true),
         "Fetching all livestream stats"
      )
      Counter.log(`Fetched ${stats.length} livestream stats`)
      counter.addToReadCount(stats.length)
      sumUpStats(stats)

      await handleSaveGroupStatsInFirestore()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const sumUpStats = (livestreamStats: LivestreamStatsWithRef[]) => {
   livestreamStats.forEach((stat) => {
      const groupIds = stat.livestream?.groupIds || []

      groupIds.forEach((groupId) => {
         if (!statsToUpdateDict[groupId]) {
            // If stats doc doesn't exist, create it

            statsToUpdateDict[groupId] = {
               // We create a partial object to update the stats, so we don't overwrite the stats that are not set by this script
               id: groupStatsId,
               generalStats: {
                  numberOfParticipants: 0,
                  numberOfRegistrations: 0,
                  numberOfApplicants: 0,
                  // numberOfPeopleReached: 0, - we don't want to overwrite this
                  // numberOfPeopleReachedCompanyPage: 0, - we don't want to overwrite this
               },
               universityStats: {},
            }
         }

         // Sum up the number of participants, registrations and applications for each group
         statsToUpdateDict[groupId].generalStats.numberOfParticipants +=
            stat.generalStats.numberOfParticipants
         statsToUpdateDict[groupId].generalStats.numberOfRegistrations +=
            stat.generalStats.numberOfRegistrations

         statsToUpdateDict[groupId].generalStats.numberOfApplicants +=
            stat.generalStats.numberOfApplicants

         Object.keys(stat.universityStats).forEach((universityCode) => {
            if (!statsToUpdateDict[groupId].universityStats[universityCode]) {
               statsToUpdateDict[groupId].universityStats[universityCode] = {
                  numberOfRegistrations: 0,
                  numberOfParticipants: 0,
                  numberOfApplicants: 0,
                  // numberOfPeopleReached: 0, - we don't want to overwrite this
                  // numberOfPeopleReachedCompanyPage: 0 - we don't want to overwrite this
               }
            }

            // Sum up the number of participants, registrations, applications for each university
            statsToUpdateDict[groupId].universityStats[
               universityCode
            ].numberOfParticipants +=
               stat.universityStats[universityCode].numberOfParticipants
            statsToUpdateDict[groupId].universityStats[
               universityCode
            ].numberOfRegistrations +=
               stat.universityStats[universityCode].numberOfRegistrations
            statsToUpdateDict[groupId].universityStats[
               universityCode
            ].numberOfApplicants +=
               stat.universityStats[universityCode].numberOfApplicants
         })
      })
   })
}

const handleSaveGroupStatsInFirestore = async () => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = Object.entries(statsToUpdateDict)
   const totalNumDocs = totalDocs.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const statsData = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      for (const [groupId, stats] of statsData) {
         writeProgressBar.increment() // Increment progress bar

         const groupStatsRef = firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("stats")
            .doc(groupStatsId)

         // check if group stats exists
         const [groupStatsSnap, group] = await Promise.all([
            groupStatsRef.get(),
            groupRepo.getGroupById(groupId),
         ])

         counter.addToReadCount(2)

         if (!group) {
            Counter.log(`Group with id ${groupId} does not exist, skipping...`)
            continue
         }

         if (groupStatsSnap.exists) {
            const currentGroupStats = {
               ...groupStatsSnap.data(),
               id: groupStatsSnap.id,
            } as GroupStats

            // Perform a deep merge of the stats
            const mergedStats = merge(currentGroupStats, stats) // The stats that are not set by this script will not be overwritten by this merge :)

            batch.update(groupStatsRef, mergedStats) // Upsert the stats data
         } else {
            // Create a new group stats doc
            const currentGroupStats = createGroupStatsDoc(group, groupStatsId)
            // Merge the stats with the new group stats doc
            const mergedStats = merge(currentGroupStats, stats)

            batch.set(groupStatsRef, mergedStats) // Set the new stats data
         }

         counter.writeIncrement() // Increment write counter
      }

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All batches committed! :)")
}
