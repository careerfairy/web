import { UserData } from "@careerfairy/shared-lib/src/users"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { userRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"
const RUNNING_VERSION = "0.1"
const counter = new Counter()

// types
type UserDataWithRef = DataWithRef<true, UserData>

export async function run() {
   try {
      Counter.log(
         `Fetching data for Backfilling Users data - Category tagging - v${RUNNING_VERSION}`
      )

      const [allUsers] = await logAction(
         () => Promise.all([userRepo.getAllUsers(true)]),
         "Fetching all Users"
      )

      Counter.log(`Fetched ${allUsers.length} Users`)

      counter.addToReadCount(allUsers.length)

      // const usersDict: Record<string, UserData> =
      //    convertDocArrayToDict(allUsers)

      // cascade group metadata to Job Applications
      await cascadeUserInterestsToCategoryTags(allUsers)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeUserInterestsToCategoryTags = async (
   // usersDictionary: Record<string, UserData>
   users: UserDataWithRef[]
) => {
   console.log("🚀 ~ usersDictionary:", users)
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   // const userKeys = Object.keys(usersDictionary)
   const totalNumDocs = users.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const usersChunk = users.slice(i, i + batchSize) // Slice the data into batches

      usersChunk.forEach((user) => {
         console.log("🚀 ~ usersChunk.forEach ~ user:", user)
         writeProgressBar.increment() // Increment progress bar

         // if (hasMetadataToUpdate) {
         //    // update customJob with metadata
         //    const toUpdate =
         //       pickPublicDataFromCustomJobApplicant(user)

         //    toUpdate.companyCountry = metadata.companyCountry
         //    toUpdate.companyIndustries = metadata.companyIndustries
         //    toUpdate.companySize = metadata.companySize

         //    // eslint-disable-next-line @typescript-eslint/no-explicit-any
         //    batch.update(user._ref as any, toUpdate)
         //    counter.writeIncrement() // Increment write counter
         // }
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Job Applications batches committed! :)")
}
