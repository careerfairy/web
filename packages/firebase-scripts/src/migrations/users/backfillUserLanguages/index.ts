import {
   LanguageProficiencies,
   LanguageProficiencyOrderMap,
} from "@careerfairy/shared-lib/dist/constants/forms"
import { ProfileLanguage, UserData } from "@careerfairy/shared-lib/dist/users"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { userRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()

// types
type UserDataWithRef = DataWithRef<true, UserData>

export async function run() {
   try {
      Counter.log("Fetching data for backfilling Users data - Languages")

      const allUsers = await logAction(
         () =>
            userRepo
               .getAllUsers(true)
               .then((users) =>
                  users.filter((user) => user.spokenLanguages?.length)
               ),
         "Fetching all Users"
      )

      Counter.log(`Fetched ${allUsers.length} users with spoken languages`)

      counter.addToReadCount(allUsers.length)

      await cascadeUserLanguages(allUsers)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeUserLanguages = async (users: UserDataWithRef[]) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalNumDocs = users.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const usersChunk = users.slice(i, i + batchSize) // Slice the data into batches

      usersChunk.forEach((user) => {
         writeProgressBar.increment() // Increment progress bar

         user?.spokenLanguages?.forEach((language) => {
            const languageRef = firestore
               .collection("userData")
               .doc(user.id)
               .collection("languages")
               .doc(language)

            const toUpdate: ProfileLanguage = {
               id: languageRef.id,
               proficiency:
                  LanguageProficiencyOrderMap[LanguageProficiencies.Advanced],
               authId: user.authId,
               languageId: language,
            }

            batch.set(languageRef, toUpdate, { merge: true })
         })
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Users languages back filled :)")
}
