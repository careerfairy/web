import * as cliProgress from "cli-progress"

import {
   BulkWriter,
   DocumentReference,
   Timestamp,
} from "firebase-admin/firestore"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
} from "../../../util/bulkWriter"

import Counter from "../../../lib/Counter"
import { DataWithRef } from "../../../util/types"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { GroupPlanTypes } from "@careerfairy/shared-lib/dist/groups"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/dist/groups/planConstants"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"

const WRITE_BATCH = 50
const progressBar = new cliProgress.SingleBar(
   {},
   cliProgress.Presets.shades_classic
)
const counter = new Counter()

export async function run() {
   try {
      const groups = await logAction(
         () => groupRepo.getAllGroups(true),
         "Fetching groups..."
      )

      counter.addToReadCount(groups.length)

      const groupsWithSparksFlagAndNoPlan = groups.filter(
         (group) => group.sparksAdminPageFlag && !group.plan
      )

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(groupsWithSparksFlagAndNoPlan.length, 0)

      await setSparksPlanForFlaggedGroups(
         groupsWithSparksFlagAndNoPlan,
         counter,
         bulkWriter
      )

      await bulkWriter.close()

      progressBar.stop()

      console.log("Finished setting sparks plan for flagged groups.")
   } catch (error) {
      console.log(error)
      throw new Error(error.message)
   } finally {
      counter.print()
   }
}

const setSparksPlanForFlaggedGroups = async (
   groupsWithSparksFlag: DataWithRef<true, Group>[],
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   let index = 0
   for (const group of groupsWithSparksFlag) {
      const nowTimeStamp = Timestamp.now()

      const expiryTimestamp = Timestamp.fromMillis(
         nowTimeStamp.toMillis() +
            PLAN_CONSTANTS.sparks.PLAN_DURATION_MILLISECONDS
      )

      const toUpdate: Pick<Group, "plan"> = {
         plan: {
            type: GroupPlanTypes.Sparks,
            startedAt: nowTimeStamp,
            expiresAt: expiryTimestamp,
         },
      }

      bulkWriter
         .update(group._ref as unknown as DocumentReference<Group>, toUpdate)
         .then(() => {
            handleBulkWriterSuccess(counter)
            progressBar.increment()
            counter.writeIncrement()
         })
         .catch((error) => {
            console.log(error)
            handleBulkWriterError(error, counter)
         })

      if (index % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }

      index++
   }
}
