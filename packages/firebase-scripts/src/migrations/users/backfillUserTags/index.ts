import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/src/users"
import Counter from "../../../lib/Counter"
import { userRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
// import { DataWithRef } from "../../../util/types"

const RUNNING_VERSION = "0.1"
const counter = new Counter()

// types
// type UserDataWithRef = DataWithRef<true, UserData>

export async function run() {
   try {
      Counter.log(
         `Fetching data for Backfilling Users data - Category tagging - v${RUNNING_VERSION}`
      )

      const [allUsers] = await logAction(
         () => Promise.all([userRepo.getAllUsers()]),
         "Fetching all Users"
      )

      Counter.log(`Fetched ${allUsers.length} Users`)

      counter.addToReadCount(allUsers.length)

      const usersDict: Record<string, UserData> =
         convertDocArrayToDict(allUsers)

      // cascade group metadata to Job Applications
      await cascadeUserInterestsToCategoryTags(usersDict)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeUserInterestsToCategoryTags = async (
   usersDictionary: Record<string, UserData>
) => {
   console.log("🚀 ~ usersDictionary:", usersDictionary)
   // const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   // const totalDocs = jobApplications
   // const totalNumDocs = jobApplications.length

   // writeProgressBar.start(totalNumDocs, 0)

   // for (let i = 0; i < totalNumDocs; i += batchSize) {
   //    const batch = firestore.batch()

   //    const customJobsApplicantsChunk = totalDocs.slice(i, i + batchSize) // Slice the data into batches

   //    customJobsApplicantsChunk.forEach((customJobApplicant) => {
   //       writeProgressBar.increment() // Increment progress bar

   //       // Get event hosts from groupsDict
   //       const jobGroup = groupsDict[customJobApplicant.groupId]

   //       if (jobGroup) {
   //          // get metadata from event hosts
   //          const metadata = getMetaDataFromCustomJobGroup(jobGroup)

   //          // Return metadata if there is at least ONE field that is not empty
   //          const hasMetadataToUpdate = Object.values(metadata).some(
   //             (field) => !isEmpty(field)
   //          )

   //          if (hasMetadataToUpdate) {
   //             // update customJob with metadata
   //             const toUpdate =
   //                pickPublicDataFromCustomJobApplicant(customJobApplicant)

   //             toUpdate.companyCountry = metadata.companyCountry
   //             toUpdate.companyIndustries = metadata.companyIndustries
   //             toUpdate.companySize = metadata.companySize

   //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
   //             batch.update(customJobApplicant._ref as any, toUpdate)
   //             counter.writeIncrement() // Increment write counter
   //          }
   //       }
   //    })

   //    await batch.commit() // Wait for batch to commit
   // }

   writeProgressBar.stop()
   Counter.log("All Job Applications batches committed! :)")
}
