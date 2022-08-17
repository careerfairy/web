import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
import { Group, GroupQuestion } from "@careerfairy/shared-lib/dist/groups"
import {
   possibleFieldsOfStudy,
   possibleLevelsOfStudy,
} from "../../../constants"
import { checkIfHasMatch, throwMigrationError } from "../../../util/misc"
import { BulkWriter } from "firebase-admin/firestore"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { groupRepo, livestreamRepo } from "../../../repositories"
import {
   LivestreamEvent,
   LivestreamGroupQuestion,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/dist/livestreams"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"

const constants = {
   numTotalLiveStreams: "Total Live Streams",
   numGroupQuestions: "Group Questions",
   numUniversityGroups: "Total Number of University Groups",
   numNonUniversityGroups: "Total Number of Non University Groups",
}

type GroupsDict = Record<Group["id"], Group>

export async function run() {
   const counter = new Counter()
   try {
      const bulkWriter = firestore.bulkWriter()
      const groups = await groupRepo.getAllGroups()
      counter.addToReadCount(groups.length)
      const groupsDict = convertDocArrayToDict(groups)

      storeGroupQuestionsOnLivestreams(
         await livestreamRepo.getAllLivestreams(),
         groupsDict,
         bulkWriter,
         counter
      )

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

const storeGroupQuestionsOnLivestreams = (
   livestreams: LivestreamEvent[],
   groupsDict: GroupsDict,
   bulkWriter: BulkWriter,
   counter: Counter
) => {
   counter.setCustomCount(counterConstants.totalNumDocs, livestreams.length)

   counter.addToCustomCount(constants.numTotalLiveStreams, livestreams.length)
   counter.addToReadCount(livestreams.length)
   loopProgressBar.start(livestreams.length, 0)
   for (let i = 0; i < livestreams.length; i++) {
      const livestream = livestreams[i]
      counter.setCustomCount(counterConstants.currentDocIndex, i)
      loopProgressBar.update(i + 1)

      const livestreamRef = firestore
         .collection("livestreams")
         .doc(livestream.id)

      const updateData: Partial<LivestreamEvent> = {
         groupQuestionsMap: getLivestreamGroupQuestions(livestream, groupsDict),
      }
      bulkWriter
         .update(livestreamRef, updateData)
         .then(() => handleBulkWriterSuccess(counter))
         .catch((err) => {
            console.error(err)
            handleBulkWriterError(err, counter)
         })
      counter.writeIncrement()
   }
   loopProgressBar.stop()
}
const getLivestreamGroupQuestions = (
   livestream: LivestreamEvent,
   groupsDict: GroupsDict
): LivestreamGroupQuestionsMap => {
   if (!livestream.groupIds?.length) return null
   return livestream.groupIds.reduce<LivestreamGroupQuestionsMap>(
      (acc, currGroupId) => {
         const group = groupsDict[currGroupId]
         if (!group) return acc
         if (group) {
            acc[group.id] = {
               groupId: group.id || null,
               groupName: group.universityName || null,
               universityCode: group.universityCode || null,
               questions:
                  group.categories?.reduce<
                     Record<LivestreamGroupQuestion["id"], GroupQuestion>
                  >((acc, currCategory) => {
                     const questionType = getQuestionType(currCategory.name)
                     if (
                        questionType === "fieldOfStudy" ||
                        questionType === "levelOfStudy"
                     ) {
                        return acc // skip storing fieldOfStudy and levelOfStudy questions on the livestream
                     }
                     acc[currCategory.id] = {
                        id: currCategory.id || null,
                        name: currCategory.name || null,
                        hidden: currCategory.hidden ?? false,
                        questionType,
                        options:
                           currCategory.options?.reduce(
                              (optionAcc, currOption) => {
                                 optionAcc[currOption.id] = {
                                    id: currOption.id || null,
                                    name: currOption.name || null,
                                 }
                                 return optionAcc
                              },
                              {}
                           ) || null,
                     }
                     return acc
                  }, {}) || null,
            }
         }
         return acc
      },
      {}
   )
}
