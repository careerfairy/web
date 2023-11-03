import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { DeepPartial } from "@careerfairy/shared-lib/dist/utils/types"
import { logAction } from "../../../util/logger"
import {
   createGroupStatsDoc,
   GroupStats,
} from "@careerfairy/shared-lib/dist/groups/stats"
import { merge } from "lodash"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

const counter = new Counter()

// types
type GroupStatsToUpdate = DeepPartial<GroupStats>

// cached globally
let statsToUpdateDict: Record<
   // groupId
   string,
   // the group stats we would like to update, we don't want to overwrite the stats that are not set by this script.
   // This will allow us to run this script multiple times without overwriting the stats that are already set
   GroupStatsToUpdate
> = {}
const groupStatsId = "groupStats"

let allGroupsDict: Record<string, Group> = {}
let allGroupStatsDict: Record<string, GroupStats> = {}

export async function run() {
   try {
      const [stats, groups, groupStats] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreamStats(true),
               groupRepo.getAllGroups(),
               groupRepo.getAllGroupStats(true),
            ]),
         "Fetching all livestream stats, group stats and groups"
      )

      Counter.log(
         `Fetched ${stats.length} livestream stats, ${groups.length} groups and ${groupStats.length} group stats`
      )

      counter.addToReadCount(stats.length + groups.length + groupStats.length)

      allGroupsDict = convertDocArrayToDict(groups)
      allGroupStatsDict = groupStats.reduce((acc, groupStat) => {
         const groupId = groupStat._ref.parent.parent.id
         delete groupStat._ref
         acc[groupId] = groupStat as GroupStats
         return acc
      }, {})

      sumUpStats(stats)

      await handleSaveGroupStatsInFirestore()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const sumUpStats = (livestreamStats: LiveStreamStats[]) => {
   livestreamStats.forEach((livestreamStat) => {
      const groupIds = livestreamStat.livestream?.groupIds || []

      groupIds.forEach((groupId) => {
         if (!statsToUpdateDict[groupId]) {
            // If stats doc doesn't exist, create it

            statsToUpdateDict[groupId] = {
               // We create a partial object to update the stats, so we don't overwrite the stats that are not set by this script
               id: groupStatsId,
               generalStats: {
                  numberOfParticipants: 0,
                  numberOfRegistrations: 0,
                  numberOfApplications: 0,
                  numberOfPeopleReached: 0,
                  // numberOfPeopleReachedCompanyPage: 0, - we don't want to overwrite this
               },
               universityStats: {},
            }
         }

         // Sum up the number of participants, registrations, applications and number of people reached  for each group
         statsToUpdateDict[groupId].generalStats.numberOfParticipants +=
            livestreamStat.generalStats.numberOfParticipants || 0
         statsToUpdateDict[groupId].generalStats.numberOfRegistrations +=
            livestreamStat.generalStats.numberOfRegistrations || 0
         statsToUpdateDict[groupId].generalStats.numberOfApplications +=
            livestreamStat.generalStats.numberOfApplicants || 0
         statsToUpdateDict[groupId].generalStats.numberOfPeopleReached +=
            livestreamStat.generalStats.numberOfPeopleReached || 0

         Object.keys(livestreamStat.universityStats).forEach(
            (universityCode) => {
               if (
                  !statsToUpdateDict[groupId].universityStats[universityCode]
               ) {
                  statsToUpdateDict[groupId].universityStats[universityCode] = {
                     numberOfRegistrations: 0,
                     numberOfParticipants: 0,
                     numberOfApplications: 0,
                     numberOfPeopleReached: 0,
                     // numberOfPeopleReachedCompanyPage: 0 - we don't want to overwrite this
                  }
               }

               // Sum up the number of participants, registrations, applications and number of people reached for each university
               statsToUpdateDict[groupId].universityStats[
                  universityCode
               ].numberOfParticipants +=
                  livestreamStat.universityStats[universityCode]
                     .numberOfParticipants || 0

               statsToUpdateDict[groupId].universityStats[
                  universityCode
               ].numberOfRegistrations +=
                  livestreamStat.universityStats[universityCode]
                     .numberOfRegistrations || 0

               statsToUpdateDict[groupId].universityStats[
                  universityCode
               ].numberOfApplications +=
                  livestreamStat.universityStats[universityCode]
                     .numberOfApplicants || 0

               statsToUpdateDict[groupId].universityStats[
                  universityCode
               ].numberOfPeopleReached +=
                  livestreamStat.universityStats[universityCode]
                     .numberOfPeopleReached || 0
            }
         )
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

         const group = allGroupsDict[groupId]

         if (!group) {
            Counter.log(`Group with id ${groupId} does not exist, skipping...`)
            continue
         }

         const currentGroupStats = allGroupStatsDict[groupId]

         if (currentGroupStats) {
            // Perform a deep merge of the stats
            const mergedStats = merge(currentGroupStats, stats) // The stats that are not set by this script will not be overwritten by this merge :)

            batch.update(groupStatsRef, mergedStats as { [x: string]: any }) // Upsert the stats data
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
