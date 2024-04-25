import { convertDocArrayToDict } from "@careerfairy/shared-lib/src/BaseFirebaseRepository"
import { CustomJob } from "@careerfairy/shared-lib/src/customJobs/customJobs"
import { getMetaDataFromCustomJobGroup } from "@careerfairy/shared-lib/src/customJobs/metadata"
import { Group } from "@careerfairy/shared-lib/src/groups"
import { isEmpty } from "lodash"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { customJobRepo, groupRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()

// types
type CustomJobWithRef = DataWithRef<true, CustomJob>

// cached globally
let groupsDict: Record<string, Group>

export async function run() {
   try {
      Counter.log("Fetching data - mock implementation")

      const [customJobs, groups] = await logAction(
         () =>
            Promise.all([
               customJobRepo.getAllCustomJobs<true>(),
               groupRepo.getAllGroups(),
            ]),
         "Fetching all custom jobs and groups"
      )

      Counter.log(
         `Fetched ${customJobs.length} custom jobs and ${groups.length} groups`
      )

      counter.addToReadCount(customJobs.length + groups.length)

      groupsDict = convertDocArrayToDict(groups)

      // cascade group metadata to customJobs
      await cascadeGroupMetaDataToCustomJobs(customJobs)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeGroupMetaDataToCustomJobs = async (
   customJobs: CustomJobWithRef[]
) => {
   let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = customJobs
   const totalNumDocs = customJobs.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const customJobsChunk = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      customJobsChunk.forEach((customJob) => {
         writeProgressBar.increment() // Increment progress bar

         // Get event hosts from groupsDict
         const jobGroup = groupsDict[customJob.groupId]

         if (jobGroup) {
            // get metadata from event hosts
            const metadata = getMetaDataFromCustomJobGroup(jobGroup)

            // Return metadata if there is at least ONE field that is not empty
            const hasMetadataToUpdate = Object.values(metadata).some(
               (field) => !isEmpty(field)
            )

            if (hasMetadataToUpdate) {
               // update customJob with metadata
               const toUpdate: Pick<
                  CustomJob,
                  "companyCountry" | "companyIndustries" | "companySize"
               > = {
                  companyCountry: metadata.companyCountry,
                  companyIndustries: metadata.companyIndustries,
                  companySize: metadata.companySize,
               }

               batch.update(customJob._ref as any, toUpdate)
               counter.writeIncrement() // Increment write counter
            }
         }
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All customJob batches committed! :)")
}
