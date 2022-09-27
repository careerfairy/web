import { firestore } from "../../../lib/firebase"
import {
   ParticipatingStudent,
   RegisteredStudent,
   TalentPoolStudent,
   UserData,
   UserReadableGroupQuestionsWithAnswerMap,
} from "@careerfairy/shared-lib/dist/users"
import Counter from "../../../lib/Counter"
import {
   Group,
   UserGroupData,
   UserGroupQuestionsWithAnswerMap,
} from "@careerfairy/shared-lib/dist/groups"
import {
   possibleFieldsOfStudy,
   possibleLevelsOfStudy,
   possibleOthers,
} from "../../../constants"
import { RegisteredGroup } from "@careerfairy/shared-lib/dist/users/users"
import {
   checkIfHasMatch,
   removeDuplicates,
   throwMigrationError,
   trimAndLowerCase,
} from "../../../util/misc"
import * as mappings from "@careerfairy/firebase-scripts/data/fieldAndLevelOfStudyMapping.json"
import {
   BulkWriter,
   DocumentReference,
   FieldValue,
   Timestamp,
} from "firebase-admin/firestore"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { groupRepo, livestreamRepo, userRepo } from "../../../repositories"
import { getArgValue } from "../../../index"
import {
   FALLBACK_DATE,
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { ReadableQuestionAndAnswer } from "@careerfairy/shared-lib/src/users"
import { GroupCategory } from "@careerfairy/shared-lib/src/groups"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"

const customCountKeys = {
   numTotalAdmins: "Total Admins",
   numMainAdmins: "Main Admins",
   numSubAdmins: "Sub Admins",
   numGroupsWithoutAdmins: "Groups Without Admins",
   numGroups: "Groups",
}

type GroupsDict = Record<Group["id"], Group>

export async function run() {
   const counter = new Counter()

   try {
      const bulkWriter = firestore.bulkWriter()
      const groups = await groupRepo.getAllGroups()
      const groupsDict = convertDocArrayToDict(groups)
      counter.addToReadCount(groups.length)
      counter.setCustomCount(counterConstants.numFailedWrites, 0)

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
