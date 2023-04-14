import { UserData } from "@careerfairy/shared-lib/dist/users"
import { INITIAL_CREDITS } from "@careerfairy/shared-lib/dist/rewards/rewards"
import * as cliProgress from "cli-progress"
import { BulkWriter, FieldValue } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import { userRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      hideCursor: true,
      clearOnComplete: false,
      ...getCLIBarOptions("Writing users", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

// cached globally
let users: DataWithRef<true, UserData>[]
let bulkWriter: BulkWriter

/**
 * Run the migration
 */
export async function run() {
   bulkWriter = firestore.bulkWriter()
   users = await logAction(() => userRepo.getAllUsers(true), "Fetching users")

   counter.addToReadCount(users.length)

   let idx = 0
   for (const user of users) {
      const ref = user._ref

      const toUpdate: Partial<UserData> = {
         // @ts-ignore points field is not defined in UserData anymore
         points: FieldValue.delete(),
         credits: INITIAL_CREDITS,
      }

      bulkWriter
         .update(ref as any, toUpdate)
         .then(() => {
            counter.writeIncrement()
         })
         .catch((error) => {
            console.error("bulkWriter.update failed", error)
            counter.addToCustomCount(counterConstants.numFailedWrites, 1)
         })
         .finally(() => {
            bar.increment()
         })

      if (++idx % 100 === 0) {
         await bulkWriter.flush()
      }
   }

   await bulkWriter.close()
   bar.stop()
   counter.print()
}
