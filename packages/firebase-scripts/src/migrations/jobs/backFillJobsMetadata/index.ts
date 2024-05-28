import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   CustomJobApplicant,
   pickPublicDataFromCustomJobApplicant,
} from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { getMetaDataFromCustomJobGroup } from "@careerfairy/shared-lib/dist/groups/metadata"
import { isEmpty } from "lodash"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { customJobRepo, groupRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const RUNNING_VERSION = "0.2"
const counter = new Counter()

// types
type CustomJobApplicantsWithRef = DataWithRef<true, CustomJobApplicant>

// cached globally
let groupsDict: Record<string, Group>

export async function run() {
   try {
      Counter.log(
         `Fetching data for Backfilling Job Applications - v${RUNNING_VERSION}`
      )

      const [allJobApplications, groups] = await logAction(
         () =>
            Promise.all([
               customJobRepo.getAllJobApplications(true),
               groupRepo.getAllGroups(),
            ]),
         "Fetching all Job Applications and Groups"
      )

      Counter.log(
         `Fetched ${allJobApplications.length} Job Applications and ${groups.length} groups`
      )

      counter.addToReadCount(allJobApplications.length + groups.length)

      groupsDict = convertDocArrayToDict(groups)

      // cascade group metadata to Job Applications
      await cascadeGroupMetaDataToCustomJobs(allJobApplications)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeGroupMetaDataToCustomJobs = async (
   jobApplications: CustomJobApplicantsWithRef[]
) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = jobApplications
   const totalNumDocs = jobApplications.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const customJobsApplicantsChunk = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      customJobsApplicantsChunk.forEach((customJobApplicant) => {
         writeProgressBar.increment() // Increment progress bar

         // Get event hosts from groupsDict
         const jobGroup = groupsDict[customJobApplicant.groupId]

         if (jobGroup) {
            // get metadata from event hosts
            const metadata = getMetaDataFromCustomJobGroup(jobGroup)

            // Return metadata if there is at least ONE field that is not empty
            const hasMetadataToUpdate = Object.values(metadata).some(
               (field) => !isEmpty(field)
            )

            if (hasMetadataToUpdate) {
               // update customJob with metadata
               const toUpdate =
                  pickPublicDataFromCustomJobApplicant(customJobApplicant)

               toUpdate.companyCountry = metadata.companyCountry
               toUpdate.companyIndustries = metadata.companyIndustries
               toUpdate.companySize = metadata.companySize

               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               batch.update(customJobApplicant._ref as any, toUpdate)
               counter.writeIncrement() // Increment write counter
            }
         }
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Job Applications batches committed! :)")
}
