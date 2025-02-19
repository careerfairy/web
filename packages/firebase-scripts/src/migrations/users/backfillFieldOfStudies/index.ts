import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { fieldOfStudyRepo, userRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()

// types
type UserDataWithRef = DataWithRef<true, UserData>

export async function run() {
   try {
      Counter.log("Fetching data for backfilling field of studies")

      const allUsers = await logAction(
         () =>
            userRepo
               .getAllUsers(true)
               .then((users) => users.filter((user) => user.fieldOfStudy?.id)),
         "Fetching all Users"
      )

      Counter.log(`Fetched ${allUsers.length} users with field of studies`)

      counter.addToReadCount(allUsers.length)

      const allFieldOfStudies = await fieldOfStudyRepo.getAllFieldsOfStudy()

      Counter.log(`Fetched ${allFieldOfStudies.length} field of studies`)

      const fieldOfStudyLookup: Record<string, FieldOfStudy> =
         allFieldOfStudies.reduce((acc, fieldOfStudy) => {
            acc[fieldOfStudy.id] = {
               ...fieldOfStudy,
               category: fieldOfStudy.category ?? "",
            }
            return acc
         }, {})

      await cascadeUserFieldOfStudies(allUsers, fieldOfStudyLookup)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeUserFieldOfStudies = async (
   users: UserDataWithRef[],
   fieldOfStudyLookup: Record<string, FieldOfStudy>
) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalNumDocs = users.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const usersChunk = users.slice(i, i + batchSize) // Slice the data into batches

      usersChunk.forEach((user) => {
         writeProgressBar.increment() // Increment progress bar

         const fieldOfStudy = fieldOfStudyLookup[user.fieldOfStudy.id]

         if (!fieldOfStudy.category) return

         counter.writeIncrement()

         const userRef = firestore.collection("userData").doc(user.id)

         const toUpdate: Pick<UserData, "fieldOfStudy"> = {
            fieldOfStudy: fieldOfStudy,
         }

         batch.update(userRef, toUpdate)
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Users field of studies back filled :)")
}
