import { DocRef } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { chunkArray } from "@careerfairy/shared-lib/dist/utils"
import * as cliProgress from "cli-progress"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import { fieldOfStudyRepo, userRepo } from "../../repositories"
import { logAction } from "../../util/logger"
import { getCLIBarOptions } from "../../util/misc"

const counter = new Counter()

const dedupeProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Fields of study reconciliation",
      "batch of users reconciled"
   ),
   cliProgress.Presets.shades_classic
)

const PERFORM_UPDATE = true
const SHOW_LONG_LOG = false

export async function run() {
   console.log("Start fields of study collection reconciliation")
   const bulkWriter = firestore.bulkWriter()

   try {
      const users = await logAction(
         () => userRepo.getAllUsers(),
         "Getting all users"
      )

      const allUsers = users

      counter.addToReadCount(allUsers.length)

      const fieldsOfStudy = await logAction(
         () => fieldOfStudyRepo.getAllFieldsOfStudy(),
         "Getting all fields of study"
      )

      const fieldsOfStudyMap: Record<string, FieldOfStudy> =
         fieldsOfStudy.reduce((acc, fieldOfStudy) => {
            acc[fieldOfStudy.id] = fieldOfStudy
            return acc
         }, {})

      const usersWithInvalidFieldsOfStudy = getUsersWithInvalidFieldsOfStudy(
         allUsers,
         fieldsOfStudy
      )

      console.log(
         `Users with invalid fields of study: ${usersWithInvalidFieldsOfStudy.length}`
      )

      const userBatches = chunkArray(usersWithInvalidFieldsOfStudy, 200)

      dedupeProgressBar.start(userBatches.length, 0)

      for (const userBatch of userBatches) {
         for (const user of userBatch) {
            const newFieldOfStudy = fieldsOfStudyMap[user.fieldOfStudy.id]

            if (PERFORM_UPDATE && newFieldOfStudy) {
               const docRef = firestore.collection("userData").doc(user.id)
               bulkWriter.update(docRef, { fieldOfStudy: newFieldOfStudy })
            }

            if (SHOW_LONG_LOG) {
               console.log({
                  user: user.id,
                  fieldOfStudy: user.fieldOfStudy,
                  newFieldOfStudy: newFieldOfStudy,
               })
            }

            counter.writeIncrement()
         }

         await bulkWriter.flush().then(() => dedupeProgressBar.increment())
      }

      dedupeProgressBar.stop()
      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
   } finally {
      counter.print()
   }
}

const getUsersWithInvalidFieldsOfStudy = (
   users: (UserData | (UserData & DocRef))[],
   validFieldsOfStudy: FieldOfStudy[]
) => {
   return users.filter((user) => {
      if (!user.fieldOfStudy) return false
      const hasMatchingFieldOfStudy = validFieldsOfStudy.find(
         (validFieldOfStudy) =>
            validFieldOfStudy.name === user.fieldOfStudy.name &&
            validFieldOfStudy.id === user.fieldOfStudy.id
      )
      return !hasMatchingFieldOfStudy
   })
}
