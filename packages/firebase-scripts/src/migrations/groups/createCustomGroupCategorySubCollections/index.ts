import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
import { Group, GroupQuestion } from "@careerfairy/shared-lib/dist/groups"
import {
   possibleFieldsOfStudy,
   possibleLevelsOfStudy,
} from "../../../constants"
import { checkIfHasMatch } from "../../../util/misc"
import { BulkWriter } from "firebase-admin/firestore"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { groupScriptsRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"

const constants = {
   numGroupQuestions: "Group Questions",
   numUniversityGroups: "Total Number of University Groups",
   numNonUniversityGroups: "Total Number of Non University Groups",
}

export async function run() {
   const counter = new Counter()
   try {
      const bulkWriter = firestore.bulkWriter()
      const groups = await groupScriptsRepo.getAllGroups()
      counter.addToReadCount(groups.length)

      createCustomGroupCategorySubCollections(groups, bulkWriter, counter)

      Counter.log("Committing all writes...")
      writeProgressBar.start(
         counter.write(),
         counter.getCustomCount(counterConstants.numSuccessfulWrites)
      )
      /*
       * Commits all enqueued writes and marks the BulkWriter instance as closed.
       * After calling close(), calling any method will throw an error.
       * Any retries scheduled as part of an onWriteError() handler will
       * be run before the close() promise resolves.
       * */
      await bulkWriter.close()
      writeProgressBar.stop()

      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const getQuestionType = (
   questionName: string
): GroupQuestion["questionType"] => {
   const isFieldOfStudy = checkIfHasMatch(questionName, possibleFieldsOfStudy)
   const isLevelOfStudy = checkIfHasMatch(questionName, possibleLevelsOfStudy)

   if (isFieldOfStudy) return "fieldOfStudy"
   if (isLevelOfStudy) return "levelOfStudy"
   return "custom"
}
// Goes through every group and creates a document for each category
// then stores each document in the group's groupQuestions sub-collection
const createCustomGroupCategorySubCollections = (
   groups: Group[],
   bulkWriter: BulkWriter,
   counter: Counter
) => {
   counter.setCustomCount(counterConstants.totalNumDocs, groups.length)

   loopProgressBar.start(groups.length, 0)
   groups.forEach((group, index) => {
      counter.setCustomCount(counterConstants.currentDocIndex, index)
      loopProgressBar.update(index + 1)
      if (!group.categories) return
      let groupHasFieldOfStudy, groupHasLevelOfStudy
      const isUniversityGroup = group.universityCode
      if (isUniversityGroup) {
         counter.customCountIncrement(constants.numUniversityGroups)
      } else {
         counter.customCountIncrement(constants.numNonUniversityGroups)
      }
      group.categories?.forEach((category) => {
         const categoryRef = firestore
            .collection(`careerCenterData/${group.id}/groupQuestions`)
            .doc(category.id)

         const questionType = getQuestionType(category.name)
         if (!groupHasFieldOfStudy) {
            groupHasFieldOfStudy = questionType === "fieldOfStudy"
         }
         if (!groupHasLevelOfStudy) {
            groupHasLevelOfStudy = questionType === "levelOfStudy"
         }

         if (isUniversityGroup || questionType === "custom") {
            const categoryData: GroupQuestion = {
               id: category.id,
               name: category.name,
               options: convertDocArrayToDict(category.options),
               questionType: questionType,
            }
            bulkWriter
               .set(categoryRef, categoryData, { merge: true })
               .then(() => handleBulkWriterSuccess(counter))
               .catch((e) => handleBulkWriterError(e, counter))
            counter.writeIncrement()
            counter.customCountIncrement(constants.numGroupQuestions)
         }
      })

      if (!groupHasFieldOfStudy && !groupHasLevelOfStudy && isUniversityGroup) {
         // throw an error if the group has no field of study or level of study
         throwMigrationError(
            `University Group ${
               group.universityName
            } has no field of study or level of study, please fix that first, Group Data: ${JSON.stringify(
               group
            )}`
         )
      }
   })
   loopProgressBar.stop()
}

const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}
