import { DocRef } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { chunkArray } from "@careerfairy/shared-lib/dist/utils"
import * as cliProgress from "cli-progress"
import * as levenshtein from "fast-levenshtein"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import { fieldOfStudyRepo, userRepo } from "../../repositories"
import { logAction } from "../../util/logger"
import { getCLIBarOptions } from "../../util/misc"

/**
 * Values less than 5 are not recommended, as for some it will not to be able to find a match.
 *
 * Based on Production data copy - 17337 users have invalid fields of study.
 *  - With a levenshtein distance of 4, 9527 users were unable to be reconciled.
 *  - With a levenshtein distance of 3, 9986 users were unable to be reconciled.
 *  - ...
 */
const MIN_LEVEN_DISTANCE = 5

const counter = new Counter()

const dedupeProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Fields of study reconciliation",
      "batch of users reconciled"
   ),
   cliProgress.Presets.shades_classic
)

const PERFORM_UPDATE = false
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

      const usersWithInvalidFieldsOfStudy = getUsersWithInvalidFieldsOfStudy(
         allUsers,
         fieldsOfStudy
      )

      console.log(
         `Users with invalid fields of study: ${usersWithInvalidFieldsOfStudy.length}`
      )

      const userBatches = chunkArray(usersWithInvalidFieldsOfStudy, 200)

      let failedReconciles = 0

      dedupeProgressBar.start(userBatches.length, 0)

      for (const userBatch of userBatches) {
         for (const user of userBatch) {
            const newFieldOfStudy = reconcileFieldOfStudy(
               user.fieldOfStudy,
               fieldsOfStudy
            )
            if (PERFORM_UPDATE && newFieldOfStudy) {
               const docRef = firestore.collection("userData").doc(user.id)

               bulkWriter.update(docRef, { fieldOfStudy: newFieldOfStudy })
               counter.writeIncrement()
            }

            if (!newFieldOfStudy) {
               failedReconciles++
            }

            if (SHOW_LONG_LOG) {
               console.log({
                  user: user.id,
                  fieldOfStudy: user.fieldOfStudy,
                  newFieldOfStudy: newFieldOfStudy,
               })
            }
         }

         await bulkWriter.flush().then(() => dedupeProgressBar.increment())
      }

      console.log(`\nFailed reconciles: ${failedReconciles}`)

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

/**
 * Reconciles the field of study of a user with the valid fields of study (documents in /fieldsOfStudy collection)
 * using the levenshtein distance algorithm.
 *
 * The Levenshtein distance between two words is the minimum number of single-character
 * edits (insertions, deletions or substitutions) required to change one word into the other
 * @param fieldOfStudy The field of study of the user
 * @param validFieldsOfStudy The valid fields of study
 * @returns The field of study that is the closest match to the user's invalid field of study
 */
const reconcileFieldOfStudy = (
   fieldOfStudy: FieldOfStudy,
   validFieldsOfStudy: FieldOfStudy[]
) => {
   return validFieldsOfStudy?.find(
      (validFieldOfStudy) =>
         levenshtein.get(validFieldOfStudy.name, fieldOfStudy.name) <=
         MIN_LEVEN_DISTANCE
   )
}
